import { URIs, callProtectedResources } from '../APIs'

/**
 * @description The object google returns to us when we request a user's profile
 */
export type UserGoogleProfile = {
  id: string,
  name: string,
  given_name: string,
  family_name: string,
  picture: string,
  locale: string
}

/**
 * @description The permissions a user has for the google sheet in use by the app
 */
export type UserSheetPermissions = {
  read: boolean,
  write: boolean
}

/**
 * @description The user object for use by client side auth stores
 */
export type User = {
  googleProfile: UserGoogleProfile,
  sheetPermissions: UserSheetPermissions
}

/**
 * @description Gets the logged in user's google profile
 * @throws 'Could not get user profile data' - If the user profile data could not be retrieved
 * @throws 'No user profile data' - If the user profile data is empty
 * @returns The logged in user's google profile
 * @example const profile = await getUserGoogleProfile();
 */
export async function getUserGoogleProfile() {
  try {
    const profile = await callProtectedResources<UserGoogleProfile>({
      method: "GET",
      url: URIs.user
    });

    if (!profile) {
      throw 'No user profile data'
    }

    return profile;
  } catch (e) {
    console.error(e);
    throw 'Could not get user profile data';
  }
}

/**
 * @description Gets the logged in user's sheet permissions
 * @throws 'Could not get user sheet permissions' - If the user sheet permissions could not be retrieved
 * @throws 'No user sheet permissions data' - If the user sheet permissions data is empty
 * @returns The logged in user's sheet permissions
 * @example const perms = await getUserSheetPermissions();
 */
export async function getUserSheetPermissions() {
  try {
    const perms = await callProtectedResources<UserSheetPermissions>({
      method: "GET",
      url: `${URIs.user}/permissions`
    });

    if (!perms) {
      throw 'No user sheet permissions data'
    }

    return perms;
  } catch (e) {
    console.error(e);
    throw 'Could not get user sheet permissions';
  }
}

/**
 * @description Gets the logged in user's google profile and sheet permissions
 * @throws 'Could not get user data' - If the user data could not be retrieved
 * @returns The logged in user's google profile and sheet permissions
 * @example const user = await getUser();
 */
export async function getUser(): Promise<User> {
  try {
    const googleProfile = await getUserGoogleProfile();
    const sheetPermissions = await getUserSheetPermissions();
    return { googleProfile, sheetPermissions };
  } catch (e) {
    console.error(e);
    throw 'Could not get user data';
  }
}
