export default [
    {
        items: [
            { text: 'Docker', link: '/docker/index' },
            { text: '基础概念', link: '/docker/01' },
            {
                text: '安装',
                collapsed: false,
                items: [
                    { text: 'CentOS', link: '/docker/centos' },
                    { text: 'Ubuntu', link: '/docker/ubuntu' },
                ]
            },
            { text: '镜像加速', link: '/docker/mirror' },
            {
                text: '私有仓库',
                collapsed: false,
                items: [
                    { text: 'Registry', link: '/docker/registry' },
                    { text: 'Harbor', link: '/docker/harbor' },
                ]
            },
            {
                text: 'Dockerfile',
                collapsed: false,
                items: [
                    { text: '定制镜像', link: '/docker/build' },
                    { text: 'Dockerfile', link: '/docker/docker_file' },
                    { text: '常用指令', link: '/docker/dockerfile1' },
                ]
            },
            { text: '网络', link: '/docker/docker-network' },
            { text: '存储', link: '/docker/docker-storage' },
            { text: 'Portainer', link: '/docker/portainer' },
            { text: 'Docker Compose', link: 'docker/docker-compose' },
            { text: 'Docker in Docker', link: 'docker/docker-in-docker' },           

        ]
    }
]