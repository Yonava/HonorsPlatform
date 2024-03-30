import axios from 'axios'
import { URIs, requestHeaders } from '../APIs'

export type UserGoogleProfile = {
  id: string,
  name: string,
  given_name: string,
  family_name: string,
  picture: string,
  locale: string
}

export type UserSheetPermissions = {
  read: boolean,
  write: boolean
}

export type User = {
  googleProfile: UserGoogleProfile,
  sheetPermissions: UserSheetPermissions
}

export async function getUserGoogleProfile() {
  try {
    const { data: profile } = await axios.get<UserGoogleProfile>(URIs.user, requestHeaders());
    return profile;
  } catch (e) {
    console.error(e);
    throw 'Could not get user profile data';
  }
}

export async function getUserSheetPermissions() {
  try {
    const { data: perms } = await axios.get<UserSheetPermissions>(`${URIs.user}/permissions`, requestHeaders());
    return perms;
  } catch (e) {
    console.error(e);
    throw 'Could not get user sheet permissions';
  }
}

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
