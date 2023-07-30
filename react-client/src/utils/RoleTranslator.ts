import type UserDetails from '../authentication/interfaces/UserDetails'

const rolesTranslation = [
  { value: 'COMPANY_ROLE_WORKER', displayName: 'Worker role' },
  { value: 'COMPANY_ROLE_MANAGER', displayName: 'Manager role' },
  { value: 'COMPANY_ROLE_ADMIN', displayName: 'Administrator role' }
]

const shortRolesTranslation = [
  { value: 'COMPANY_ROLE_WORKER', displayName: 'Worker' },
  { value: 'COMPANY_ROLE_MANAGER', displayName: 'Manager' },
  { value: 'COMPANY_ROLE_ADMIN', displayName: 'Administrator' }
]

// GET TRANSLATED (human readable) ROLE
function translateRoles (roles: string[]) {
  const translatedRoles: string[] = []
  roles.forEach((role) => {
    const translationFound = rolesTranslation.find((roleTranslation) => (roleTranslation.value === role))
    if (translationFound != null)
      translatedRoles.push(translationFound.displayName)
    else
      translatedRoles.push('Unknown role')
  })

  return translatedRoles.join(', ')
}

// GET TRANSLATED (human readable) ROLE
function translateRolesForNavbar (principal: UserDetails | null | undefined) {
  if (principal == null) return 'Unknown role'

  const translatedRoles: string[] = []
  principal.roles.forEach((role) => {
    const translationFound = shortRolesTranslation.find((roleTranslation) => (roleTranslation.value === role))
    if (translationFound != null)
      translatedRoles.push(translationFound.displayName)
    else
      translatedRoles.push('Unknown role')
  })

  return translatedRoles.join(', ')
}

export default {
  translateRoles,
  translateRolesForNavbar
}
