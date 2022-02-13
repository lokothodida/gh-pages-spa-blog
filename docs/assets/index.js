const Home = {
    template: `<div><h1>Github Pages Blog</h1></div>`,
};

const app = Vue.createApp({});

app.use(VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
        {
            path: "/",
            component: Home,
        }
    ],
}));

app.mount("#app");
