export default [
    {
        items: [
            { text: 'Docker', link: '/docker/index' },
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
                    { text: 'CentOS', link: '/docker/centos' },
                    { text: 'Ubuntu', link: '/docker/ubuntu' },
                ]
            },
            { text: '镜像加速', link: '/docker/mirror' },
            { text: '网络', link: '/docker/docker-network' },
            { text: '存储', link: '/docker/docker-storage' },
            { text: 'Portainer', link: '/docker/portainer' },
            { text: 'Dockerfile', link: '/docker/docker-file' },
            { text: 'Docker Compose', link: 'docker/docker-compose' },
            { text: 'Docker in Docker', link: 'docker/docker-in-docker' },           

        ]
    }
]