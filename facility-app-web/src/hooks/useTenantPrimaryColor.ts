'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSettingsContext } from 'providers/SettingsProvider';
import { SET_PRIMARY_COLOR } from 'reducers/SettingsReducer';

const useTenantPrimaryColor = () => {
  const { data: session } = useSession();
  const { configDispatch } = useSettingsContext();
  const primaryColour = session?.user?.primaryColour;

  useEffect(() => {
    configDispatch({ type: SET_PRIMARY_COLOR, payload: primaryColour ?? null });
  }, [primaryColour, configDispatch]);
};

export default useTenantPrimaryColor;
