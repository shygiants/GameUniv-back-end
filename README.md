# npm 패키지 설치

`package.json`의 dependency에 따라 패키지들을 설치해주어야 합니다.

```sh
$ sudo npm install
```

# 보안상 repository 정책

`.gitignore`에 repository에 중요한 정보들이 노출되는 것을 방지하기 위해 몇몇 파일을 추가해두었습니다.

`config-template.js`파일을 복사하여 `config.js`로 수정하여 알맞은 값을 입력해주세요.

# App 구조

## `middlewares/`

middleware들의 configuration을 담당한다.

### `middlewares/passport.js`

Passport의 Strategy 설정을 하는 부분이다.

## `models/`

Mongoose의 Model Schema를 설정하는 부분

## `routes/`

Express의 Router를 담당한다.

### `routes/authTokens.js`

`/authTokens`이하의 route를 담당한다.

사용자의 이메일과 비밀번호를 받아 JWT를 발급하는 역할을 담당한다.

### `routes/users.js`

`/users`이하의 route를 담당한다.

Signup이나 Request의 `Authorization` Header를 decoding하여 authentication, private한 user 정보들을 제공하는 역할을 담당한다.

## `app.js`

App의 핵심

## `config.js`

보안상 숨겨야 하는 정보들을 담아둔 파일
