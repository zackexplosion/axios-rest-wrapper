# axios-rest-wrapper

Wraping [axios](https://github.com/axios/axios) as rest client

# Fixes in axios version 0.18
1. fix interceptors order bug
2. axios.get with params not working like my expect



``` js
axios.get('/hello', {params: { 'isGoodDay': 'no' })
// it should send request with /hello?isGoodDay=no
// but in current version(0.18) it just send request to /hello

```
# Installation

```
npm install axios-rest-wrapper
```

# Example

``` js

// create API instance, yes I just pass the arguments to axios.create()
const API = AxiosRestWrapper({
  baseURL: process.env.SOMEWHERE,
  interceptors: {
    // using this syntax arugment to fix interceptors reverse order issue in version 0.18.
    request: [
      [function(config) {
        return config
      }, function (error) {
        return Promise.reject(error)
      }]
    ]
  },
  restResources: {
    user: {
      prefix: 'users', // required
      key: 'id', // optional
      instanceMethods : { // optional, usage below
        mudamuda: function() {
          return false
        }
      },
      classMethods : { // optional, usage below
        wryyyyyy: function() {
          return 'raod rolla  daaaaaaaaaaaa!!'
        }
      }
    }
  }
})

API.user.wryyyyyy()
// 'raod rolla  daaaaaaaaaaaa!!'

user = API.user.find(1)
// send GET request to /users/1

user.mudamuda()
// false

user.update({yeee: ''})
// PUT /users/1 with body {yeee: ''}
```
# Contribution

We don't have delete method and nested resource support now.