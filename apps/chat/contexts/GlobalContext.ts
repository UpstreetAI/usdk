'use client'

import { createContainer } from 'react-tracked';
import { env } from '@/lib/env';
import { useState } from 'react';

interface GlobalState {
    isDevMode: boolean;
};

const initialGlobalState: GlobalState = {
    isDevMode: env.NEXT_PUBLIC_ENVIRONMENT === 'development' ? true : false,
};

const useGlobalStateInternal = () => useState<GlobalState>(initialGlobalState);

export const {
    Provider: GlobalStateProvider,
    useTracked: useGlobalState
} = createContainer(useGlobalStateInternal);