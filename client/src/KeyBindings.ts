export default function keyBindings(e: KeyboardEvent, state: any) {
  if (document.activeElement !== document.body) return
  if (e.key === 'a') {
    state.autoSync.value  = !state.autoSync.value
  } else if (e.key === 's') {
    state.showAddModal.value = !state.showAddModal.value
  } else if (e.key === 'r') {
    state.refreshStudents()
  } else if (e.key === '/') {
    const input = document.querySelector('input')
    if (input) input.focus()
    e.preventDefault()
  }
}