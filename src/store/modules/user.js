import { login as loginApi, logout as logoutApi, getInfo as getInfoApi } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // user login : 로그인 (실서버 응답: { token, user } 가정)
  // login({ commit }, userInfo) {
  //   const { username, password } = userInfo
  //   return new Promise((resolve, reject) => {
  //     login({ username: username.trim(), password: password }).then(response => {
  //       const { data } = response
  //       commit('SET_TOKEN', data.token)
  //       setToken(data.token)
  //       resolve()
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // },
  async login({ commit }, userInfo) {
    const { username, password } = userInfo
    const res = await loginApi({ username: username.trim(), password })

    // utils/request.js 가 response.data(res)만 반환한다고 가정
    const token = res?.token || res?.data?.token
    if (!token) {
      // 서버가 {message}만 줄 수도 있으므로 안전하게 처리
      throw new Error(res?.message || '로그인 실패: 토큰이 없습니다.')
    }

    commit('SET_TOKEN', token)
    setToken(token) // 로컬 저장
    // 이름은 서버가 내려주면 그걸로, 아니면 입력값 사용
    const displayName = res?.user?.name || res?.user?.username || username
    commit('SET_NAME', displayName)

    return true // Login.vue에서 then으로 라우팅
  },

  // get user info : 내 정보 조회 (실서버 응답: { name, avatar } 또는 { user:{...} })
  // getInfo({ commit, state }) {
  //   return new Promise((resolve, reject) => {
  //     getInfo(state.token).then(response => {
  //       const { data } = response

  //       if (!data) {
  //         return reject('Verification failed, please Login again.')
  //       }

  //       const { name, avatar } = data

  //       commit('SET_NAME', name)
  //       commit('SET_AVATAR', avatar)
  //       resolve(data)
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // },
  async getInfo({ commit, state }) {
    // 토큰은 요청 인터셉터에서 Authorization 헤더로 자동 부착된다고 가정
    const res = await getInfoApi()

    // 다양한 응답 케이스 방어적 파싱
    const data = res?.data || res?.user || res
    if (!data) {
      throw new Error('인증 검증 실패: 사용자 정보를 불러올 수 없습니다.')
    }

    const name = data.name || data.username || '사용자'
    const avatar = data.avatar || '' // 서버가 없으면 기본값
    commit('SET_NAME', name)
    commit('SET_AVATAR', avatar)
    return data
  },

  // user logout : 로그아웃 (백엔드 엔드포인트가 없으면 클라이언트만 초기화)
  // logout({ commit, state }) {
  //   return new Promise((resolve, reject) => {
  //     logout(state.token).then(() => {
  //       removeToken() // must remove  token  first
  //       resetRouter()
  //       commit('RESET_STATE')
  //       resolve()
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // },
  async logout({ commit, state }) {
    try {
      if (logoutApi) await logoutApi(state.token) // 서버에 엔드포인트가 있을 때만
    } catch (e) {
      // 서버 로그아웃 실패해도 클라이언트 상태는 정리
      console.warn('logout api error (ignored):', e?.message)
    } finally {
      removeToken()
      resetRouter()
      commit('RESET_STATE')
    }
  },

  // remove token : 토큰만 초기화
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

