import {config} from 'dotenv'
import { DaskeyboardAPI } from './daskeyboard/daskeyboardAPI'
import { DasKeyboardSignal, DasKeyboardSignal2, DasKeyboardSignalAction, DasKeyboardSignalEffect } from './daskeyboard/types'
import { GithubAPI } from './github/githubAPI'
import { PRStatus, StatusResponse } from './github/types'

config({ override: true })

const env = {
  GITHUB_AUTH_TOKEN: process.env.GITHUB_AUTH_TOKEN,
  DAS_KEYBOARD_API: process.env.DAS_KEYBOARD_API ?? 'http://localhost:27301',
  DAS_KEYBOARD_PID: process.env.DAS_KEYBOARD_PID,
  SIGNAL_LIMIT: +(process.env.SIGNAL_LIMIT ?? 5),
  SIGNAL_ORIGIN_X: +(process.env.SIGNAL_ORIGIN_X ?? 0),
  SIGNAL_ORIGIN_Y: +(process.env.SIGNAL_ORIGIN_Y ?? 0),
}

const errorKeys = []
Object.entries(env).forEach(([key, v]: [string, string | number]) => {
  if (v == null) {
    errorKeys.push(key)
  }
  if (['SIGNAL_LIMIT', 'SIGNAL_ORIGIN_X', 'SIGNAL_ORIGIN_Y'].indexOf(key) >= 0 && isNaN(v as number)) {
    errorKeys.push(key)
  } 
})

if (errorKeys.length) {
  console.error('Missing or invalid ENV values:', errorKeys.join(', '))
  process.exit(1)
}

const githubAPI = new GithubAPI(env.GITHUB_AUTH_TOKEN)
const dkAPI = new DaskeyboardAPI(env.DAS_KEYBOARD_API)

function getColorEffectByStatus(status: PRStatus): {color: string, effect: DasKeyboardSignalEffect} {
  switch (status) {
      case PRStatus.ERROR: {
          return {
              color: '#FF0000',
              effect: DasKeyboardSignalEffect.SET_COLOR
          };
      }
      case PRStatus.NEEDS_WORK: {
          return {
              color: '#DE4816',
              effect: DasKeyboardSignalEffect.SET_COLOR
          };
      }
      case PRStatus.NEEDS_REVIEW: {
          return {
              color: '#FFFF00',
              effect: DasKeyboardSignalEffect.SET_COLOR
          };
      }
      case PRStatus.PENDING: {
          return {
              color: '#FFFF00',
              effect: DasKeyboardSignalEffect.BREATHE
          };
      }
      case PRStatus.READY: {
          return {
              color: '#00FF00',
              effect: DasKeyboardSignalEffect.SET_COLOR
          };
      }
      default: {
          return {
              color: '#FFFFFF',
              effect: DasKeyboardSignalEffect.SET_COLOR
          };
      }
  }
}

function mapPRStatusToSignal(pr: StatusResponse, zoneId: string): DasKeyboardSignal2 {
  const {color, effect} = getColorEffectByStatus(pr.status)
  const signal: DasKeyboardSignal2 = {
    action: DasKeyboardSignalAction.DRAW,
    actionValue: JSON.stringify([{zoneId, color, effect, link: pr.link}]),
    clientName: 'GitHub PR Status',
    link: {
      url: pr.link,
      label: 'View on GitHub',
    },
    errors: undefined,
    isMuted: true,
    message: pr.message,
    name: pr.title,
    pid: env.DAS_KEYBOARD_PID,
  }

  if (pr.error) {
    signal.action = DasKeyboardSignalAction.ERROR
    signal.errors = [pr.error]
  }

  return signal
}

async function run() {
  const trackedPRStatus = await githubAPI.getMyPRStatuses(env.SIGNAL_LIMIT)
  const startingZoneX = env.SIGNAL_ORIGIN_X
  const startingZoneY = env.SIGNAL_ORIGIN_Y
  const signals = trackedPRStatus.map((pr, i) => {
    const zone = `${startingZoneX+i},${startingZoneY}`
    return mapPRStatusToSignal(pr, zone)
  })
  return await Promise.all(signals.map((s) => dkAPI.createSignal(s).catch((e) => {console.error(e)})))
}

async function read() {
  const existingSignals = await dkAPI.getSignalByZoneId(env.DAS_KEYBOARD_PID, `3,2`)
  return existingSignals
}

// read()
// .catch((err) => {
//   console.error(err)
//   return []
// })
// .then((signals) => {
//   console.log(signals)
// })

run().then((result) => {
  console.log('[Github PR Status]: signals updated')
  return read()
}).catch((err) => {
  console.error(err)
  return []
})
.then((signals) => {
  console.log(signals)
})
