import React, {
  useCallback,
  useEffect,
  useRef,
  // createContext,
} from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import styles from '../../../styles/AuthUi.module.css';

//

const AuthWrap = ({ supabaseClient, children }) => {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;

    if (el) {
      const onMouseDown = (e) => {
        let element = e.target;
        // Traverse up the DOM tree to find if any parent is a button
        while (element && element.nodeName !== 'BUTTON') {
          element = element.parentElement;
        }

        if (element && element.nodeName === 'BUTTON') {
          localStorage.removeItem('jwt');
        }
      };

      el.addEventListener('click', onMouseDown, true);

      return () => {
        el.removeEventListener('click', onMouseDown, true);
      };
    }
  }, [ref.current]);

  return <div ref={ref}>{children}</div>;
};

export const AuthUiLoginTool = ({
  supabaseClient,
  view = 'sign_up',
  redirectTo,
}) => {
  const { supabase } = supabaseClient;
  return (
    <AuthWrap supabaseClient={supabaseClient}>
      <div className="flex relative">
        <img
          src="/assets/upstreet_logo_white.svg"
          className="w-auto h-24 inline-block m-auto mt-12"
          alt={'www.upstreet.ai'}
        />
      </div>
      <div className="text-center pt-12 text-gray-200 text-2xl mb-8">
        Login to continue...
      </div>
      <Auth
        supabaseClient={supabase}
        theme="dark"
        appearance={{
          theme: ThemeSupa,
          // If you want to extend the default styles instead of overriding it, set this to true
          extend: true,
          // Your custom classes
          className: {
            button: styles.authButtonLoginTool,
            container: styles.authContainer,
            anchor: styles.authAnchor,
            divider: styles.authDivider,
            label: styles.authLabel,
            input: styles.authInput,
            loader: styles.authLoader,
            message: styles.authMessage,
          },
          variables: {
            default: {
              colors: {
                brand: '#3f51b5',
                brandAccent: '#6573c3',
              },
              // fonts: {
              //   bodyFontFamily: `M PLUS 1`,
              //   buttonFontFamily: `Muli`,
              //   inputFontFamily: `M PLUS 1`,
              //   labelFontFamily: `M PLUS 1`,
              // },
            },
          },
        }}
        providers={[
          'twitter',
          'discord',
          'google',
          // 'facebook',
          'github',
        ]}
        onlyThirdPartyProviders={true}
        localization={{
          variables: {
            sign_in: {
              // email_label: 'Email',
              email_label: '',
              email_input_placeholder: 'email',
              // password_label: 'Password',
              password_label: '',
              password_input_placeholder: 'password',

              social_provider_text: ' {{provider}}',
              // button_label: 'Sign in w/ email',
            },
            sign_up: {
              // email_label: 'Email',
              email_label: '',
              email_input_placeholder: 'email address',
              // password_label: 'Password',
              password_label: '',
              password_input_placeholder: 'Choose a password',

              social_provider_text: ' {{provider}}',
            },
            forgotten_password: {
              // email_label: 'Email',
              email_label: '',
              email_input_placeholder: 'your@email.com',

              button_label: 'Send instructions',
              loading_button_label: 'Sending instructions...',
            },
          },
        }}
        view={view}
        redirectTo={redirectTo}
      />
    </AuthWrap>
  );
};
