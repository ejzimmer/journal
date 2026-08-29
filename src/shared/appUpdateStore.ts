type Listener = () => void

let waitingRegistration: ServiceWorkerRegistration | undefined
const listeners = new Set<Listener>()

export function setWaitingRegistration(registration: ServiceWorkerRegistration) {
  waitingRegistration = registration
  listeners.forEach((listener) => listener())
}

export function getWaitingRegistration() {
  return waitingRegistration
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
