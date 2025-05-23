import { useAuthManager, useUserManager } from '@/components/Context';
import { Dunes } from '@/components/ui/dunes';
import { invokeMainChannel } from '@/lib/utils';
import { MainChannels } from '@analogia/models/constants';
import { Button } from '@analogia/ui/button';
import { Icons } from '@analogia/ui/icons';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/ThemeProvider';

enum SignInMethod {
    GITHUB = 'github',
    GOOGLE = 'google',
}

export const SignIn = observer(() => {
    const { t } = useTranslation();
    const authManager = useAuthManager();
    const userManager = useUserManager();
    const [lastSignInMethod, setLastSignInMethod] = useState<SignInMethod | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (userManager.settings && userManager.settings.settings?.signInMethod) {
            setLastSignInMethod(userManager.settings.settings.signInMethod as SignInMethod);
        }
    }, [authManager.authenticated]);

    const handleLogin = (method: SignInMethod) => {
        authManager.signIn(method);
        userManager.settings.update({ signInMethod: method });
    };

    function openExternalLink(url: string) {
        invokeMainChannel(MainChannels.OPEN_EXTERNAL_WINDOW, url);
    }

    return (
        <div className="flex h-[calc(100vh-2.5rem)]">
            <div className="flex flex-col justify-between w-full h-full max-w-xl p-16 space-y-8 overflow-auto">
                <div className="flex items-center space-x-2">
                    <Icons.AnalogiaTextLogo
                        theme={theme === 'system' ? 'dark' : theme}
                        viewBox="0 0 139 17"
                    />
                </div>
                <div className="space-y-8">
                    <div className="space-y-2 uppercase rounded-full p-1 px-2 w-auto inline-block text-micro border-[0.5px] text-blue-400 border-blue-400">
                        <p>{t('welcome.alpha')}</p>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-title1 leading-tight">
                            {lastSignInMethod ? t('welcome.titleReturn') : t('welcome.title')}
                        </h1>
                        <p className="text-foreground-analogia text-regular">
                            {t('welcome.description')}
                        </p>
                    </div>
                    <div className="space-x-2 flex flex-row">
                        <div className="flex flex-col items-center w-full">
                            <Button
                                variant="outline"
                                className={`w-full text-active text-small ${lastSignInMethod === SignInMethod.GITHUB ? 'bg-teal-100 dark:bg-teal-950 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-100 text-small hover:bg-teal-200/50 dark:hover:bg-teal-800 hover:border-teal-500/70 dark:hover:border-teal-500' : 'bg-background-analogia'}`}
                                onClick={() => handleLogin(SignInMethod.GITHUB)}
                            >
                                <Icons.GitHubLogo className="w-4 h-4 mr-2" />{' '}
                                {t('welcome.login.github')}
                            </Button>
                            {lastSignInMethod === SignInMethod.GITHUB && (
                                <p className="text-teal-500 text-small mt-1">
                                    {t('welcome.login.lastUsed')}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-center w-full">
                            <Button
                                variant="outline"
                                className={`w-full text-active text-small ${lastSignInMethod === SignInMethod.GOOGLE ? 'bg-teal-100 dark:bg-teal-950 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-100 text-small hover:bg-teal-200/50 dark:hover:bg-teal-800 hover:border-teal-500/70 dark:hover:border-teal-500' : 'bg-background-analogia'}`}
                                onClick={() => handleLogin(SignInMethod.GOOGLE)}
                            >
                                <Icons.GoogleLogo viewBox="0 0 24 24" className="w-4 h-4 mr-2" />
                                {t('welcome.login.google')}
                            </Button>
                            {lastSignInMethod === SignInMethod.GOOGLE && (
                                <p className="text-teal-500 text-small mt-1">
                                    {t('welcome.login.lastUsed')}
                                </p>
                            )}
                        </div>
                    </div>
                    <p className="text-small text-foreground-analogia">
                        {t('welcome.terms.agreement')}{' '}
                        <button
                            onClick={() => openExternalLink('https://analogia.ai/privacy-policy')}
                            className="text-gray-300 hover:text-gray-50 underline transition-colors duration-200"
                        >
                            {t('welcome.terms.privacy')}
                        </button>{' '}
                        {t('welcome.terms.and')}{' '}
                        <button
                            onClick={() => openExternalLink('https://analogia.ai/terms-of-service')}
                            className="text-gray-300 hover:text-gray-50 underline transition-colors duration-200"
                        >
                            {t('welcome.terms.tos')}
                        </button>
                    </p>
                </div>
                <div className="flex flex-row space-x-1 text-small text-gray-600">
                    <p>{t('welcome.version', { version: window.env.APP_VERSION })}</p>
                </div>
            </div>
            <Dunes />
        </div>
    );
});
