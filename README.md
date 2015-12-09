# 소개

차세대 게임 플랫폼 **'Game Univ.'** 의 서버 어플리케이션입니다.

전체적인 구조는 MEAN Stack 구조를 갖추고 있습니다. 여기서의 MEAN은 MongoDB, Express, AngularJS, Node.js를 말합니다.

## Front-end

기본적으로는 AngularJS 기반의 SPA(Single Page App)입니다. Ajax를 통해서 back-end와 통신을 하기 때문에 페이지의 이동이 없이 동적인 어플리케이션을 구성합니다.

프레임워크는 Materialize를 사용하였습니다. Materialize는 Google이 제시한 새로운 디자인 철학인 'Material design'을 준수한 웹 front-end 프레임워크로서 다양한 component를 CSS와 JavaScript로 구현하였습니다.

## Back-end

Node.js 플랫폼의 엔진으로 구성하였고 웹 프레임워크로 Express를 사용하여 Restful App, API를 구성했습니다. 이로써 AngularJS나 Android와 같은 다양한 플랫폼의 front-end client의 resource server 역할을 수행합니다.

데이터베이스는 NoSQL 데이터베이스인 MongoDB를 사용하였고 Node.js ODM인 Mongoose를 사용했습니다.

# npm 패키지 설치

`package.json`의 dependency에 따라 패키지들을 설치해주어야 합니다.

```sh
$ sudo npm install
```
# bower 패키지 설치

`bower.json`의 dependency에 따라 패키지들을 설치해주어야 합니다.

```sh
$ sudo npm install -g bower
$ bower install
```

# 보안상 repository 정책

GitHub의 public repository에 중요한 환경 정보들(DB secret, 암호화 key 등)이 노출되는 것을 방지하기 위해 `.gitignore`을 설정해두었습니다.

`config-template.js`을 복사하여 `config.js`을 생성한 다음, 수정하여 알맞은 환경을 설정해주세요.

# 참고

* [MongoDB](https://www.mongodb.org/)
* [Express](http://expressjs.com/en/index.html)
* [AngularJS](https://angularjs.org/)
* [Node.js](https://nodejs.org/en/)
* [npm](https://www.npmjs.com/)
* [mongoose](http://mongoosejs.com/)
* [Promises](https://www.promisejs.org/)
* [Bower](http://bower.io/)
* [Materialize](http://materializecss.com/)
* [Jade](http://jade-lang.com/)
* [Material design spec](http://www.google.com/design/spec/material-design/introduction.html)

# App 구조

## `middlewares/`

express의 middleware들

## `models/`

Mongoose의 Model Schema를 설정하는 부분

## `routes/`

Express의 Router를 담당하는 부분

## `app.js`

MEAN Stack App의 핵심

## `config.js`

보안상 숨겨야 하는 정보들을 포함한 다양한 configuration 정보를 담아둔 파일

## `public/`

static 파일들

### `public/js/`

AngularJS App의 로직

## `views/`

jade 템플릿 파일들

## `utils`

유틸리티
