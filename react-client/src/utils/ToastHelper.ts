function makeToast (toast: any, toastMessage: string, toastStatus: 'success' | 'info' | 'warning') {
  toast({
    title: toastMessage,
    variant: 'left-accent',
    status: toastStatus,
    position: 'top-right',
    isClosable: true
  })
}

export default {
  makeToast
}
