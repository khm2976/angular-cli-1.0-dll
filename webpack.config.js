const path = require('path');
const ProgressPlugin = require('./node_modules/webpack/lib/ProgressPlugin');
const HtmlWebpackPlugin = require('./node_modules/html-webpack-plugin');
const ExtractTextPlugin = require('./node_modules/extract-text-webpack-plugin');
const autoprefixer = require('./node_modules/autoprefixer/lib/autoprefixer');
const postcssUrl = require('./node_modules/postcss-url');

const {
    NoEmitOnErrorsPlugin,
    LoaderOptionsPlugin
} = require('./node_modules/webpack/lib/webpack');
const {
    GlobCopyWebpackPlugin,
    BaseHrefWebpackPlugin
} = require('./node_modules/@angular/cli/plugins/webpack');
const {
    CommonsChunkPlugin
} = require('./node_modules/webpack/lib/webpack').optimize;
const {
    AotPlugin
} = require('./node_modules/@ngtools/webpack/src');

const nodeModules = path.join(process.cwd(), 'node_modules');
const entryPoints = ["inline", "polyfills", "sw-register", "styles", "vendor", "main"];
const baseHref = "";
const deployUrl = "";




module.exports = {
    "devtool": "source-map",    // 소스맵 생성 여부 및 방법. 어떤 소스맵을 사용할 것인지
    "resolve": {                // 모듈 해석시 경로나 확장자를 처리할 수 있도록 하는 옵션.
        "extensions": [         // 확장자
            ".ts",
            ".js"
        ],
        "modules": [            // 모듈을 해석시 먼저 탐색할 폴더를 지정
            "./node_modules"
        ]
    },
    "resolveLoader": {
        "modules": [            // resolve와 동일하지만, resolveLoader는 loader모듈만 해석
            "./node_modules"
        ]
    },
    "entry": {                  // 엔트리파일
        "main": [
            "./src/main.ts"
        ],
        "polyfills": [
            "./src/polyfills.ts"
        ],
        "styles": [             // 전역으로 처리될 스타일
            "./src/styles.css"
        ]
    },
    "output": {
        "path": path.join(process.cwd(), "dist"),
        "filename": "[name].bundle.js",
        "chunkFilename": "[id].chunk.js"
    },
    "module": {
        "rules": [{
                "enforce": "pre", // "enforce": "pre"로 설정된 것을 먼저 수행
                "test": /\.js$/,
                "loader": "source-map-loader", // 모든 js에서 소스 맵을 추출
                "exclude": [
                    /\/node_modules\//
                ]
            },
            {
                "test": /\.json$/,              // json파일 번들
                "loader": "json-loader"
            },
            {
                "test": /\.html$/,
                "loader": "raw-loader"          // 문자열로 파일을 가져올 수 있도록 처리
            },
            {
                "test": /\.(eot|svg)$/,
                "loader": "file-loader?name=[name].[hash:20].[ext]"  // 폰트, svg 파일 로더
            },
            {
                "test": /\.(jpg|png|gif|otf|ttf|woff|woff2|cur|ani)$/,
                "loader": "url-loader?name=[name].[hash:20].[ext]&limit=10000"  // 작은 이미지, 폰트에 대해 문자열 형태로 변환하여 번들 처리
            },
            {
                "exclude": [
                    path.join(process.cwd(), "src/styles.css") // 전역css는 제외
                ],
                "test": /\.css$/,
                "loaders": [
                    "exports-loader?module.exports.toString()", 
                    //3. source파일에 대해 module.exports / export 설정을 허용한다.
                    "css-loader?{\"sourceMap\":false,\"importLoaders\":1}",
                    // 2. CSS 파일을 파싱, 자바스크립트로 변환
                    // importLoaders: css-loader이전에 적용된 로더 수를 활성화/비활성화 또는 설정한다.
                    // 0 => no loaders (default)
                    // 1 => postcss-loader
                    // 2 => postcss-loader, sass-loade
                    "postcss-loader"  
                    // 1. 플러그인을 이용하여 css를 변환 ex)autoprefixer, postcss-for
                ]
            },
            {
                "exclude": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.scss$|\.sass$/,  // scss, sass 파일에 대하여
                "loaders": [
                    "exports-loader?module.exports.toString()",
                    "css-loader?{\"sourceMap\":false,\"importLoaders\":1}",
                    "postcss-loader",
                    "sass-loader"           // 사스 로더 추가
                ]
            },
            {
                "exclude": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.less$/,          // less 파일에 대하여
                "loaders": [
                    "exports-loader?module.exports.toString()",
                    "css-loader?{\"sourceMap\":false,\"importLoaders\":1}",
                    "postcss-loader",
                    "less-loader"           // less 로더 추가
                ]
            },
            {
                "exclude": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.styl$/,          // styl 파일에 대하여
                "loaders": [
                    "exports-loader?module.exports.toString()",
                    "css-loader?{\"sourceMap\":false,\"importLoaders\":1}",
                    "postcss-loader",
                    "stylus-loader?{\"sourceMap\":false,\"paths\":[]}"
                    // stylus 로더추가
                ]
            },
            {
                "include": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.css$/,
                "loaders": ExtractTextPlugin.extract({  
                    // 전역 css파일에 대하여 텍스트를 파일로 추출한다.
                    // 번들 파일 내에서 인라인으로 많은 양의 코드를 처리하기보다 구분하여 병렬 호출 처리
                    "use": [
                        "css-loader?{\"sourceMap\":false,\"importLoaders\":1}",
                        "postcss-loader"
                    ],
                    "fallback": "style-loader", // css 파일 추출 실패시 style-loader로 렌더처리
                    "publicPath": ""  // 경로 재설정
                })
            },
            {
                "include": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.scss$|\.sass$/,
                "loaders": ExtractTextPlugin.extract({
                    "use": [
                        "css-loader?{\"sourceMap\":false,\"importLoaders\":1}",
                        "postcss-loader",
                        "sass-loader"
                    ],
                    "fallback": "style-loader",
                    "publicPath": ""
                })
            },
            {
                "include": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.less$/,
                "loaders": ExtractTextPlugin.extract({
                    "use": [
                        "css-loader?{\"sourceMap\":false,\"importLoaders\":1}",
                        "postcss-loader",
                        "less-loader"
                    ],
                    "fallback": "style-loader",
                    "publicPath": ""
                })
            },
            {
                "include": [
                    path.join(process.cwd(), "src/styles.css")
                ],
                "test": /\.styl$/,
                "loaders": ExtractTextPlugin.extract({
                    "use": [
                        "css-loader?{\"sourceMap\":false,\"importLoaders\":1}",
                        "postcss-loader",
                        "stylus-loader?{\"sourceMap\":false,\"paths\":[]}"
                    ],
                    "fallback": "style-loader",
                    "publicPath": ""
                })
            },
            {
                "test": /\.ts$/,
                "loader": "@ngtools/webpack"  // 앵귤러 타입스크립트 컴파일 로더
            }
        ]
    },
    "plugins": [
        new NoEmitOnErrorsPlugin(),     // 컴파일 도중 오류가 발생한 리소스들은 제외하고 번들링
        new GlobCopyWebpackPlugin({     // GlobCopyWebpackPlugin을 사용하여 해당되는 파일을 output 폴더에 복사
            "patterns": [
                "assets",
                "favicon.ico"
            ],
            "globOptions": {
                "cwd": "/Users/fermata/my_develop/angular-cli-1.0-webpack-extends/src",
                "dot": true,
                "ignore": "**/.gitkeep"
            }
        }),
        new ProgressPlugin(),   // 웹팩의 빌드 진행율을 표시
        new HtmlWebpackPlugin({ // 빌드 결과물로 HTML 파일을 생성
            "template": "./src/index.html",
            "filename": "./index.html",
            "hash": false,
            "inject": true, // 템플릿에 빌드 결과물 주입시 위치, true || 'head' || 'body' || false
            "compile": true,
            "favicon": false,
            "minify": false,
            "cache": true,
            "showErrors": true,
            "chunks": "all",
            "excludeChunks": [],
            "title": "Webpack App",
            "xhtml": true,
            "chunksSortMode": function sort(left, right) {  // HTML에 포함되기 전에 청크 정렬 제어
                let leftIndex = entryPoints.indexOf(left.names[0]);
                let rightindex = entryPoints.indexOf(right.names[0]);
                if (leftIndex > rightindex) {
                    return 1;
                } else if (leftIndex < rightindex) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }),
        new BaseHrefWebpackPlugin({}),
        // <base href=" /> 태그 삽입 및 업데이트 처리
        new CommonsChunkPlugin({    // 여러 EntryPoint에서 사용하는 공통 모듈을 별도파일로 분리
            "name": "inline",
            "minChunks": null
        }),
        new CommonsChunkPlugin({
            "name": "vendor",
            "minChunks": (module) => module.resource && module.resource.startsWith(nodeModules), // vendor에 지정한 라이브러리가 모두 node_modules에 있다는 걸 명시적으로 선언
            "chunks": [
                "main"
            ]
        }),
        new ExtractTextPlugin({  // entry css 파일 추출
            "filename": "[name].bundle.css",
            "disable": true
        }),
        new LoaderOptionsPlugin({   // 로더에 옵션을 넣어주는 플러그인
            "sourceMap": false,
            "options": {  // 스타일 관련된 로더에 옵션을 설정
                "postcss": [
                    autoprefixer(),
                    postcssUrl({
                        "url": (URL) => {
                            // Only convert root relative URLs, which CSS-Loader won't process into require().
                            if (!URL.startsWith('/') || URL.startsWith('//')) {
                                return URL;
                            }
                            if (deployUrl.match(/:\/\//)) {
                                // If deployUrl contains a scheme, ignore baseHref use deployUrl as is.
                                return `${deployUrl.replace(/\/$/, '')}${URL}`;
                            } else if (baseHref.match(/:\/\//)) {
                                // If baseHref contains a scheme, include it as is.
                                return baseHref.replace(/\/$/, '') +
                                    `/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
                            } else {
                                // Join together base-href, deploy-url and the original URL.
                                // Also dedupe multiple slashes into single ones.
                                return `/${baseHref}/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
                            }
                        }
                    })
                ],
                "sassLoader": {
                    "sourceMap": false,
                    "includePaths": []
                },
                "lessLoader": {
                    "sourceMap": false
                },
                "context": ""
            }
        }),
        new AotPlugin({
            "mainPath": "main.ts",
            "hostReplacementPaths": {
                "environments/environment.ts": "environments/environment.ts"
            },
            "exclude": [],
            "tsConfigPath": "src/tsconfig.app.json",
            "skipCodeGeneration": true
        })
    ],
    "node": {
        "fs": "empty",
        "global": true,
        "crypto": "empty",
        "tls": "empty",
        "net": "empty",
        "process": true,
        "module": false,
        "clearImmediate": false,
        "setImmediate": false
    }
};