module.exports = {
  apps : [
    {
      name: "server-dev",
      script: "npm",
      args: "run dev"
    },
    {
      name: "server-prod",
      script: "npm",
      args: "run prod"
    }
  ]
}
