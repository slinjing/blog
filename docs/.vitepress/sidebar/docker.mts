export default [
    {
        // text: 'Docker',
        // collapsed: false,
        items: [
            { text: 'Docker', link: '/docker/index_back' },
            {
                text: '基础知识',
                collapsed: false,
                items: [
                    { text: '容器', link: '/docker/container' },
                    { text: '镜像', link: '/docker/image' },
                    { text: '仓库', link: '/docker/registry' },
                ]
            },
            {
                text: '安装',
                collapsed: false,
                items: [
                    { text: 'CentOS', link: '/docker/install-centos' },
                    { text: 'Ubuntu', link: '/docker/install_ubuntu' },
                ]
            },
            { text: '镜像加速', link: '/docker/mirror' },
            { text: '使用镜像', link: '/docker/image' },
            {
                text: 'Dockerfile',
                collapsed: false,
                items: [
                    { text: 'Dockerfile 指令', link: '/docker/install-centos' },
                    { text: 'Dockerfile 多阶段构建', link: '/docker/install_ubuntu' },
                ]
            },
            { text: '网络', link: '/docker/docker-network' },
            { text: '存储', link: '/docker/docker-storage' },
            { text: 'Dockerfile', link: '/docker/docker-file' },
            { text: 'Docker Compose', link: 'docker/docker-compose' },
            { text: 'Portainer', link: '/docker/portainer' },

        ]
    }
]