<template>
    <div class="p-1 mb-2 pr-2 card flex justify-between bg-white rounded shadow-md py-2">
        <div class="flex gap-1 px-3 self-center">
            <div class="breadcrumb-nav ">
                <Breadcrumb :home="home" :model="breadcrumbs">
                    <template #item="{ item, props }">
                        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                            <a :href="href" v-bind="props.action" @click="navigate">
                                <span :class="[item.icon, 'text-color']" />
                                <span class="text-primary-500 dark:text-primary-400 font-semibold">{{ item.label
                                    }}</span>
                            </a>
                        </router-link>
                        <a v-else :href="item.url" :target="item.target" v-bind="props.action">
                            <span class="text-surface-700 dark:text-surface-0/80">{{ item.label }}</span>
                        </a>
                    </template>
                </Breadcrumb>
                <div class="pl-5 text-xl font-bold  text-blue-900" v-if="breadcrumbs && breadcrumbs.length">
                    {{ breadcrumbs[breadcrumbs.length - 1].label }}
                </div>
            </div>
        </div>
        <div>
                <Button size="small" class=" text-white" @click="logout" label="Logout" icon="pi pi-sign-out" />
        </div>
    </div>
</template>

<script>

export default {
    data() {
        return {
            iconClass: 'pi-moon',
            items: [
                {
                    label: 'Profile',
                    icon: 'pi pi-user-edit'
                },
                {
                    label: 'Logout',
                    icon: 'pi pi-sign-out',
                    command: () => {
                        localStorage.clear();
                        this.$router.push('/login');
                    }
                }
            ],
            home: {
                icon: 'pi pi-home',
                route: '/'
            }
        }
    },
    mounted() {
    },
    methods: {
        onThemeToggler() {
            const root = document.getElementsByTagName('html')[0];
            root.classList.toggle('dark');
            this.iconClass = this.iconClass === 'pi-moon' ? 'pi-sun' : 'pi-moon';
        },
        onUserToggler() {
            this.$refs.menu.toggle(event);
        },
        logout() {
            localStorage.clear();
            this.$router.push('/login');
        }
    },
    computed: {
        breadcrumbs() {
            const route = this.$route;
            const matchedRoutes = route.matched;
            const selectedRoute = matchedRoutes.filter(route => route.meta?.breadcrumb?.length)
            if (selectedRoute.length) {
                return selectedRoute[0].meta.breadcrumb.map(data => ({
                    label: data.label,
                    route: data.route
                }))
            }
            return null
        },
    }
};
</script>