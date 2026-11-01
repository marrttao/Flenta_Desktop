interface AuthErrorInput
{
	code?: string;
	status?: number;
	message?: string;
}

type Translate = (key: string) => string;



function mapAuthError(error: AuthErrorInput, translate: Translate): string
{
	switch (error.code)
	{
		case 'auth.invalid_credentials': { return translate('auth.errors.invalid_credentials'); }
		case 'auth.email_not_confirmed': { return translate('auth.errors.email_not_confirmed'); }
		case 'auth.registration_failed': { return translate('auth.errors.registration_failed'); }
		case 'auth.rate_limited': { return translate('auth.errors.rate_limited'); }
		case 'auth.invalid_session': { return translate('auth.errors.invalid_session'); }
		case 'auth.invalid_challenge': { return translate('auth.errors.security'); }
		case 'auth.invalid_verifier': { return translate('auth.errors.security'); }
		case 'password.invalid_length': { return translate('auth.errors.password_invalid_length'); }
		case 'profile.invalid_name': { return translate('auth.errors.profile_invalid_name'); }
		case 'email.invalid': { return translate('auth.errors.email_invalid'); }

		default:
		{
			if (error.status === 429) { return translate('auth.errors.rate_limited'); }
			if (error.status === 503) { return translate('auth.errors.provider_unavailable'); }
			
			return error.message || translate('auth.errors.generic');
		}
	}
}



export { mapAuthError }