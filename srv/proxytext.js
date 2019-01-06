/* global __dirname */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const oFun = require(__dirname + '/../src/fun.js');
global.oFun = oFun;
global.oClass = require(__dirname + '/../src/class.js');
oFun.global.console();
const config = {};
config.domains = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/domains.json'), 'utf-8'));
config.servers = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/servers.json'), 'utf-8'));
config.sys = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/sys.json'), 'utf-8'));
config.sys.diag.logdir = path.join(path.dirname(__dirname), 'log');
config.sys.http.listen_addr = process.argv[3] ? process.argv[3] : '0.0.0.0';
config.sys.http.listen_port = process.argv[2] ? parseInt(process.argv[2], 10) : 80;
config.sys.http.ssl.enabled = 0;
config.sys.http.proxy_pass = 'http://10.86.2.72';//反向代理后端WEB
config.sys.http.limit = {};
config.sys.http.limit.enabled = 1;
config.sys.http.limit.max_size_byte = 1024 * 1024 * 2.0;//限制文件大小(字节)
config.sys.http.limit.max_gzsize_byte = 1024 * 1024 * 1.0;//限制GZ压缩后的大小(字节)
config.sys.http.process = 1; //开启文本处理模块（一般只需在SLB中开启）
config.sys.http.beian.enabled = (config.sys.http.listen_port === 84); //是否开启备案检测
global.config = config;
console.info(config);
if (config.sys.http.beian.enabled) console.info('备案检测功能已开启');
oFun.http.server(oFun, config);
