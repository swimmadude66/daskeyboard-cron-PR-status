
export enum DasKeyboardSignalEffect {
    SET_COLOR = 'SET_COLOR',
    BLINK = 'BLINK',
    BREATHE = 'BREATHE',
    COLOR_CYCLE = 'COLOR_CYCLE',
    RIPPLE = 'RIPPLE',
    INWARD_RIPPLE = 'INWARD_RIPPLE',
    BOUNCING_LIGHT = 'BOUNCING_LIGHT',
    LASER = 'LASER',
    WAVE = 'WAVE'
}

export enum DasKeyboardSignalAction {
    DRAW = 'DRAW',
    ERROR = 'ERROR',
    FLASH = 'FLASH'
}

export interface DasKeyboardSignal {
    name: string
    message: string
    action: DasKeyboardSignalAction
    link?: string
    zoneId: string
    color: string
    effect?: DasKeyboardSignalEffect
    errors?: string[]
    pid: string
    /**
     * Ignored on localhost
     */
    isArchived?: boolean
        /**
     * Ignored on localhost
     */
    isRead?: boolean
    /**
     * not implemented
     */
    isMuted?: boolean
    clientName?: string
}

export interface DasKeyboardSignal2 {
    action: DasKeyboardSignalAction
    /** JSON stringified list of points */
    actionValue: string
    clientName?: string
    extensionId?: string
    
    data?: any
    
    link?: {
        url: string
        label: string
    }
    errors?: string[]
    isMuted?: boolean
    message: string
    name: string
    pid: string
}


export interface DasKeyboardErrorSignal extends DasKeyboardSignal2 {
    action: DasKeyboardSignalAction.ERROR
    errors: string[]
}

export interface DasKeyboardSignalResponse extends DasKeyboardSignal{
    createdAt: Date | number
    updatedAt: Date | number
    userId: number
    id: number
}

export interface GetDasKeyboardSignalsResponse {
    content: DasKeyboardSignalResponse[]
    size: number
    sort: string
    hasNextPage: boolean
    page: number
    totalElements: number
    totalPages: number
}