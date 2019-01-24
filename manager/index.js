const SSH = require('simple-ssh');
const argv = require('argv');
let hosts;
try {
  hosts = require('./hosts');
} catch (e) {
  throw new Error('hosts.js file not found!');
}
const _ = require('lodash');
const request = require('request-promise');
const args = argv
  .option([
    {
      name: 'reload-all',
      type: 'string',
      description: 'Should reload all PM2 processes',
    },
    {
      name: 'reload',
      type: 'number',
      description: 'Defines id of host to reload PM2 process',
    },
    {
      name: 'status-all',
      type: 'string',
      description: 'Health statuses of all SteamBots',
    },
    {
      name: 'status',
      type: 'number',
      description: 'Defines id of host to get SteamBot status',
    },
    {
      name: 'stop',
      type: 'number',
      description: 'Defines id of host to stop',
    },
    {
      name: 'stop-all',
      type: 'string',
      description: 'Should stop all PM2 processes',
    },
    {
      name: 'deploy',
      type: 'number',
      description: 'Defines id of host to deploy',
    },
    {
      name: 'deploy-all',
      type: 'string',
      description: 'Should deploy all SteamBots',
    },
  ])
  .run();

function main() {
  if (!_.isNil(args.options['reload-all'])) {
    restart()
      .then(console.log.bind(console))
      .catch(console.error.bind(console));
    return;
  }
  if (!_.isNil(args.options['reload'])) {
    const id = _.parseInt(args.options['reload']);
    restart(id)
      .then(console.log.bind(console))
      .catch(console.error.bind(console));
    return;
  }
  if (!_.isNil(args.options['status-all'])) {
    statuses()
      .then(statuses => statuses.forEach(status => console.log(status)))
      .catch(console.error.bind(console));
  }
  if (!_.isNil(args.options['status'])) {
    const id = _.parseInt(args.options['status']);
    statuses(id)
      .then(console.log.bind(console))
      .catch(console.error.bind(console));
  }
  if (!_.isNil(args.options['stop'])) {
    const id = _.parseInt(args.options['stop']);
    stop(id)
      .then(console.log.bind(console))
      .catch(console.error.bind(console));
  }
  if (!_.isNil(args.options['stop-all'])) {
    stop()
      .then(console.log.bind(console))
      .catch(console.error.bind(console));
    return;
  }
  if (!_.isNil(args.options['deploy'])) {
    const id = _.parseInt(args.options['deploy']);
    deploy(id)
      .then(console.log.bind(console))
      .catch(console.error.bind(console));
  }
  if (!_.isNil(args.options['deploy-all'])) {
    deploy()
      .then(console.log.bind(console))
      .catch(console.error.bind(console));
    return;
  }
}

async function restart(id) {
  if (_.isNil(id)) {
    const promises = hosts.map(
      (_, index) =>
        new Promise((resolve, reject) => {
          const ssh = connect(index);
          ssh
            .exec('/bin/bash -l -c "pm2 restart all --update-env"', {
              out: resolve,
              err: reject,
            })
            .start();
        }),
    );
    return Promise.all(promises);
  } else {
    return new Promise((resolve, reject) => {
      const ssh = connect(id);
      ssh
        .exec('/bin/bash -l -c "pm2 restart all --update-env"', {
          out: resolve,
          err: reject,
        })
        .start();
    });
  }
}

function stop(id) {
  if (!_.isNil(id)) {
    return new Promise((resolve, reject) => {
      const ssh = connect(id);
      ssh
        .exec('/bin/bash -l -c "pm2 stop all"', {
          out: resolve,
          err: reject,
        })
        .start();
    });
  } else {
    const promises = hosts.map(
      (_, index) =>
        new Promise((resolve, reject) => {
          const ssh = connect(index);
          ssh
            .exec('/bin/bash -l -c "pm2 stop all"', {
              out: resolve,
              err: reject,
            })
            .start();
        }),
    );
    return Promise.all(promises);
  }
}

function deploy(id) {
  if (!_.isNil(id)) {
    return new Promise((resolve, reject) => {
      const ssh = connect(id);
      ssh
        .exec(
          '/bin/bash -l -c "cd ultimate-steam-bot && rm -rf logs/debug* && pm2 flush && pm2 delete all && git fetch && git reset --hard origin/master && yarn run build && pm2 start ecosystem.config.yaml"',
          {
            out: resolve,
            err: reject,
          },
        )
        .start();
    });
  } else {
    const promises = hosts.map(
      (_, index) =>
        new Promise((resolve, reject) => {
          const ssh = connect(index);
          ssh
            .exec(
              '/bin/bash -l -c "cd ultimate-steam-bot && rm -rf logs/debug* && pm2 flush && pm2 delete all && git fetch && git reset --hard origin/master && yarn run build && pm2 start ecosystem.config.yaml"',
              {
                out: resolve,
                err: reject,
              },
            )
            .start();
        }),
    );
    return Promise.all(promises);
  }
}

function statuses(id) {
  if (_.isNil(id)) {
    const promises = hosts.map(async host =>
      request({
        url: `http://${host}:3001`,
        headers: { 'Content-Type': 'application-json' },
        json: true,
        method: 'GET',
      }),
    );
    return Promise.all(promises);
  } else {
    const host = hosts[id];
    if (_.isNil(host)) {
      throw new Error(`Cannot find host with id ${id}`);
    }
    return request({
      url: `http://${host}:3001`,
      headers: { 'Content-Type': 'application-json' },
      json: true,
      method: 'GET',
    });
  }
}

function connect(id) {
  return new SSH({
    host: hosts[id],
    user: process.env.LOGIN,
    pass: process.env.PASSWORD,
  });
}

main();
