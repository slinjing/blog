export default[
    { text: 'Home', link: '/' },
    { text: 'Linux', link: '/linux/index' },
    { text: 'Python', link: '/python/index' },
    {
      text: 'Cloud Native',
      items: [
        { text: 'Docker', link: '/docker/index' },
        { text: 'Kubernetes', link: '/kubernetes/index' },
        { text: 'Prometheus', link: '/prometheus/index' },
      ]
    },
    {
      text: 'CI/CD',
      items: [
        { text: 'Gitlab', link: '/cicd/gitlab' },
        { text: 'Harbor', link: '/cicd/harbor' },
        { text: 'Jenkins', link: '/cicd/jenkins' },
      ]
    },
    {
      text: '中间件',
      items: [
        { text: 'MySQL', link: '/mysql/index' },
        { text: 'Nginx', link: '/nginx/index' },
        { text: 'Kafka', link: '/other/kafka' },
      ]
    },
    { text: '其他', link: '/other/tools' }
]

      