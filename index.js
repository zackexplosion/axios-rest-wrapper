const AxiosRestWrapper = function(options) {
  const axios = require('axios')
  const qs = require('qs')
  const {
    restResources = {},
    interceptors = []
  } = options

  // remove unused prop
  delete options.restResources
  delete options.interceptors

  const _ = axios.create(Object.assign({}, {
    transformResponse: [function (data) {
      // Do whatever you want to transform the data
      try {
        return JSON.parse(data)
      } catch (error) {
        logger.error(error)
      }
      // return data
    }],
  }, options))

  const RestEndpoint = function (options = {}) {
    const {
      key = 'id',
      prefix,
      classMethods = {},
      instanceMethods = {}
    } = options

    let instance = {
      create: async attrs => {
        let resource = await _.post(`/${prefix}`, attrs)
        return new RestObject({prefix, key, resource, instanceMethods})
      },
      find: async (id, params = {}) => {
        let resource = await _.get(`/${prefix}/${id}`, {params})
        return new RestObject({prefix, key, resource, instanceMethods})
      },
      findAll: async (params = {}) => {
        let resources = await _.get(`/${prefix}`, { params })
        return resources.map(resource => {
          return new RestObject({prefix, key, resource, instanceMethods})
        })
      }
    }

    // create class methods
    Object.keys(classMethods).map(function(key) {
      let method = classMethods[key]
      if (typeof method == 'function' ) instance[key] = method.bind(instance)
    })

    return instance
  }

  const RestObject = function (options = {}) {
    const {
      key = 'id',
      prefix,
      resource,
      instanceMethods = {}
    } = options

    // create instance methods
    Object.keys(instanceMethods).map(function(key) {
      let method = instanceMethods[key]
      // binding function to resources
      if (typeof method == 'function' ) {
        resource[key] = method.bind(resource)
      }
    })

    resource.update = attrs => {
      return _.put(`/${prefix}/${resource[key]}`, attrs).then(resource =>{
        return new RestObject({resource, prefix, key, instanceMethods})
      })
    }

    resource.delete = attrs => {
      return _.delete(`/${prefix}/${resource[key]}`, attrs)
    }

    return resource
  }


  // to fix interceptors order issue, put it in reverse order
  Object.keys(interceptors).forEach(key => {
    interceptors[key].reverse().forEach(v => {
      _.interceptors[key].use(v[0], v[1])
    })
  })

  // Add a request interceptor
  _.interceptors.request.use(function (config) {
    // fix params not working issue
    if (config.params && Object.keys(config.params).length > 0) {
      config.url = `${config.url}?${qs.stringify(config.params)}`
    }
    return config
  }, function (error) {
    // Do something with request error
    return Promise.reject(error)
  })

  // Add a response interceptor
  _.interceptors.response.use(function (response) {
    // just return data
    return response.data
  }, function (error) {
    // Do something with response error
    return Promise.reject(error)
  })

  // create restResources
  Object.keys(restResources).forEach(key => {
    let options = restResources[key]
    if( typeof options === 'string') {
      options = { prefix: options }
    }
    _[key] = new RestEndpoint(options)
  })

  return _
}

module.exports = AxiosRestWrapper
