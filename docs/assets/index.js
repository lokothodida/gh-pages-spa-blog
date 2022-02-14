function setTitle(title) {
    document.querySelector("title").textContent = title;
}

const markdownConverter = new showdown.Converter({
    tables: true,
});

const Home = (entries) => ({
    props: ["year", "month", "day"],

    data() {
        return {
            entries,
            tags: '',
        };
    },

    template: `<div>
        <h1>Github Pages Blog</h1>
        <p>
            Search for tags: <input type="text" v-model="tags" placeholder="e.g. tag1, tag2"/>
        </p>
        <ul>
            <li v-for="entry in filteredEntries">
                <h2><router-link :to="{name: 'entry', params: getEntryParams(entry)}">
                    {{ entry.title }}
                </router-link></h2>
                <p>Posted <i>{{ entry.date }}</i></p>
                <div v-html="asHTML(entry.description)"></div>
            </li>
        </ul>
    </div>`,

    mounted() {
        setTitle("Github Pages Blog");
    },

    computed: {
        filteredEntries() {
            const tags = this.tags.split(",").map(t => t.trim()).filter(t => t);

            return entries.filter(entry => {
                let date = entry.date.toISOString().split("T")[0].split("-")
                let keep = true;

                keep = keep && (!this.year || this.year == date[0]);
                keep = keep && (!this.month || this.month == date[1]);
                keep = keep && (!this.day || this.day == date[2]);
                keep = tags.reduce((keep, tag) => keep && entry.tags.includes(tag), keep);

                return keep;
            })
        }
    },

    methods: {
        getEntryParams(entry) {
            const date = entry.date.toISOString().split("T")[0].split("-");
            return {
                id: entry.id,
                year: date[0],
                month: date[1],
                day: date[2],
            }
        },

        asHTML(markdown) {
            return markdownConverter.makeHtml(markdown);
        }
    },
});

const Entry = (entries) => ({
    props: ["year", "month", "day", "id"],

    data() {
        return {
            content: '',
        };
    },

    template: `<div>
        <div v-html="content"></div>
        <p><router-link :to="{name: 'home'}">Back to home</router-link></p>
    </div>`,

    mounted() {
        this.loadEntry();
    },

    methods: {
        async loadEntry() {
            const details = entries.find(entry => {
                return entry.id == this.id &&
                    entry.date.toISOString().split("T")[0] == `${this.year}-${this.month}-${this.day}`;
            });

            if (!details) {
                return;
            }

            let entry = await fetch(`./data/entries/${this.id}.md`).then(markdown => markdown.text());
            this.content = markdownConverter.makeHtml(entry);
            setTitle(details.title);
        },
    }
});

fetch("./data/config.yaml").then(yaml => yaml.text()).then(blob => {
    const config = jsyaml.load(blob);
    const entries = config.entries.map(entry => ({
        ...entry,
        date: new Date(entry.date),
    })).sort((entry1, entry2) => -(entry1.date > entry2.date));
    const app = Vue.createApp({});

    app.use(VueRouter.createRouter({
        history: VueRouter.createWebHashHistory(),
        routes: [
            {
                name: "home",
                path: "/:year?/:month?/:day?",
                component: Home(entries),
                props(router) {
                    return {
                        year: router.params.year,
                        month: router.params.month,
                        day: router.params.day,
                    };
                }
            },
            {
                name: "entry",
                path: "/entries/:year/:month/:day/:id",
                component: Entry(entries),
                props(router) {
                    return {
                        year: router.params.year,
                        month: router.params.month,
                        day: router.params.day,
                        id: router.params.id,
                    }
                }
            },
        ],
    }));

    app.mount("#app");
});
