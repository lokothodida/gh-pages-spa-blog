const markdownConverter = new showdown.Converter({
    tables: true,
});

const Home = {
    template: `<div>
        <h1>Github Pages Blog</h1>
        <ul>
            <li v-for="entry in entries">
                <h2><router-link :to="{name: 'entry', params: { id: entry.id }}">
                    {{ entry.title }}
                </router-link></h2>
                <p>Posted <i>{{ entry.date }}</i></p>
                <div v-html="asHTML(entry.description)"></div>
            </li>
        </ul>
    </div>`,

    data() {
        return {
            entries: [],
        };
    },

    mounted() {
        this.loadEntries();
    },

    methods: {
        async loadEntries() {
            let config = jsyaml.load(await fetch("./data/config.yaml").then(yaml => yaml.text()));
            this.entries = config.entries;
        },

        asHTML(markdown) {
            return markdownConverter.makeHtml(markdown);
        }
    },
};

const Entry = {
    props: ["id"],

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
            let entry = await fetch(`./data/entries/${this.id}.md`).then(markdown => markdown.text());
            this.content = markdownConverter.makeHtml(entry);
        },

        asHTML(markdown) {
            return markdownConverter.makeHtml(markdown);
        }
    }
};

const app = Vue.createApp({});

app.use(VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
        {
            name: "home",
            path: "/",
            component: Home,
        },
        {
            name: "entry",
            path: "/entries/:id",
            component: Entry,
            props(router) {
                return {
                    id: router.params.id,
                }
            }
        },
    ],
}));

app.mount("#app");
