const { src, dest, parallel, series, watch } = require("gulp");
const del = require("del");
const browserSyncServer = require("browser-sync").create();
// 将所有 gulp- 开头的插件自动加载，后面可以通过 plugins.sass、plugins.imagemin 的方式去使用
// 如果插件名含有两个 -，比如 gulp-clean-css，则需要通过 plugins.cleanCss 驼峰方式调用
const plugins = require("gulp-load-plugins")();
const config = {
  // 源码目录
  src: "src",
  // 打包目录
  dist: "dist",
  // 样式目录
  styles: "assets/styles/*.scss",
  // 脚本目录
  scripts: "assets/scripts/*.js",
  // 图片目录
  images: "assets/images/*",
  // 字体目录
  fonts: "assets/fonts/*",
  // 其它目录，即不需要转换的文件，直接拷贝到打包目录即可
  public: "public",
  // 临时目录
  temp: "temp",
  // 模板目录
  tpls: "*.html",
  // 模板文件需要的数据
  data: {
    menus: [
      { name: "Home", icon: "aperture", link: "index.html" },
      { name: "Features", link: "features.html" },
      { name: "About", link: "about.html" },
      {
        name: "Contact",
        link: "#",
        children: [
          { name: "Twitter", link: "https://twitter.com" },
          { name: "divider" },
          { name: "Weibo", link: "https://weibo.com" },
          { name: "divider" },
          { name: "Github", link: "https://github.com" }
        ]
      }
    ],
    pkg: require("./package.json"),
    date: new Date()
  }
};

// 定义一个 style 的私有构建任务
const style = () => {
  // 通过配置项 cwd 指定相对于工作目录的文件夹，即：src/assets/styles/*.scss
  // 通过配置项 base 指定打包后的基准路径，从而保留的打包前的目录结构，即：assets/styles/*.scss
  return (
    src(config.styles, {
      cwd: config.src,
      base: config.src
    })
      // 通过 gulp-sass 插件转换 scss 文件为 css 文件
      // gulp-sass 会忽略掉以下划线开头的 scss 文件，因为下划线开头的文件是其它 scss 文件的依赖文件
      .pipe(plugins.sass())
      .pipe(dest(config.temp))
      // 以流的方式推送给浏览器，刷新浏览器
      .pipe(browserSyncServer.reload({ stream: true }))
  );
};

// 定义一个 script 的私有构建任务
const script = () => {
  return src(config.scripts, {
    cwd: config.src,
    base: config.src
  })
    .pipe(plugins.babel({ presets: ["@babel/preset-env"] }))
    .pipe(dest(config.temp))
    .pipe(browserSyncServer.reload({ stream: true }));
};

// 定义一个 page 的私有构建任务
const page = () => {
  return (
    src(config.tpls, {
      cwd: config.src,
      base: config.src
    })
      // 使用 gulp-swig 插件编译模板，并传递模板需要的数据
      // 防止模板缓存导致页面不能及时更新
      .pipe(plugins.swig({ data: config.data, defaults: { cache: false } }))
      .pipe(dest(config.temp))
      .pipe(browserSyncServer.reload({ stream: true }))
  );
};

// 定义一个 image 的私有构建任务
const image = () => {
  return src(config.images, {
    cwd: config.src,
    base: config.src
  })
    .pipe(plugins.imagemin())
    .pipe(dest(config.dist));
};

// 定义一个 font 的私有构建任务
const font = () => {
  return src(config.fonts, {
    cwd: config.src,
    base: config.src
  })
    .pipe(plugins.imagemin())
    .pipe(dest(config.dist));
};

// 定义一个 extra 的私有构建任务
const extra = () => {
  return src("*", {
    cwd: config.public,
    base: config.public
  }).pipe(dest(config.dist));
};

// 定义一个 clean 清除任务
const clean = () => {
  return del([config.temp, config.dist]);
};

// 定义一个私有的 server 开发服务器任务
const server = () => {
  // Gulp 的 watch 方法监听相应文件变化，执行相应任务
  watch(config.styles, { cwd: config.src }, style);
  watch(config.scripts, { cwd: config.src }, script);
  watch(config.tpls, { cwd: config.src }, page);

  // 监听文件变化时，自动刷新浏览器
  // 对于图片、字体、以及 public 目录中的文件，在开发阶段去监视它们的变化然后去重新构建
  // 会影响开发阶段的构建开销，这个开销在开发阶段是没有意义的
  // 只要在项目发布时，将图片、字体做压缩即可
  watch(
    [config.images, config.fonts],
    { cwd: config.src },
    browserSyncServer.reload
  );
  watch("**", { cwd: config.public }, browserSyncServer.reload);

  // 初始化 web 服务器相关配置
  browserSyncServer.init({
    notify: false,
    open: true,
    port: 8888,
    // 指定监听文件，当文件改变后自动更新浏览器
    // 可以不用这个配置，通过给 style、script、page 任务添加一个 pipe 以流的方式推送给浏览器，刷新浏览器
    // files: 'dist/**',
    server: {
      // 配置网站根目录
      baseDir: [config.dist, config.src, config.public],
      // 路由配置
      routes: {
        // 将 /node_modules 的请求路径映射到 node_modules 目录
        "/node_modules": "node_modules"
      }
    }
  });
};

// 定义一个私有的 useref 构建任务
const useref = () => {
  return src(config.tpls, {
    cwd: config.temp,
    base: config.temp
  })
    .pipe(
      plugins.useref({
        searchPath: [config.temp, ".", ".."]
      })
    )
    .pipe(
      plugins.if(
        /\.html$/,
        plugins.htmlmin({
          // 去空格空行
          collapseWhitespace: true,
          // 压缩 html 文件中的 css 代码
          minifyCSS: true,
          // 压缩 html 文件中的 js 代码
          minifyJs: true
        })
      )
    )
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(dest(config.dist));
};

// 定义一个私有的 compile 并行组合构建任务
const compile = parallel(page, style, script);

// 定义一个私有的 build 串行组合构建任务
const build = series(clean, parallel(compile, image, font, extra), useref);

// 开发阶段不需要去构建图片、字体、public 目录中的文件，减少开发阶段的构建开销
const develop = series(clean, compile, server);

// 通过 CommonJs 规范选择性导出构建任务
module.exports = {
  build,
  develop,
  clean
};
