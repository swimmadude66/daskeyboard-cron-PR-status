import axios, { AxiosInstance } from 'axios';
import { DasKeyboardSignal, DasKeyboardSignal2, DasKeyboardSignalResponse, GetDasKeyboardSignalsResponse } from './types';

export class DaskeyboardAPI {

    private _api: AxiosInstance

    constructor(apiURL: string) {
        this._api = axios.create({
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            },
            baseURL: apiURL
        })
    }

    // TODO: add auth logic for Q cloud


    createSignal(signal: DasKeyboardSignal | DasKeyboardSignal2): Promise<DasKeyboardSignalResponse> {
        return this._api.post('/api/2.0/signals', signal).then((res) => res.data)
    }

    getSignals(page: number = 1, size: number = 20, sort: 'ASC' | 'DESC' = 'ASC'): Promise<GetDasKeyboardSignalsResponse> {
        return this._api.get('/api/1.0/signals', {params: {
            page,
            size,
            sort
        }}).then((res) => res.data)
    }

    getSignalByZoneId(pid: string, zoneId: string): Promise<DasKeyboardSignalResponse> {
        return this._api.get(`/api/1.0/signals/pid/${pid}/zoneId/${zoneId}`).then((res) => res.data)
    }

    getSignalColorByZoneId(pid: string, zoneId: string): Promise<string> {
        return this._api.get(`/api/1.0/signals/pid/${pid}/zoneId/${zoneId}/color`).then((res) => res.data)
    }

    getShadows(): Promise<DasKeyboardSignalResponse[]> {
        return this._api.get('/api/2.0/signals/shadows').then((res) => res.data)
    }

    getShadowsForPID(pid: string): Promise<DasKeyboardSignalResponse[]> {
        return this._api.get(`/api/1.0/signals/pid/${pid}`).then((res) => res.data)
    }

    deleteSignalById(id: number): Promise<void> {
        return this._api.delete(`/api/2.0/signals/${id}`).then((res) => res.data)
    }

    deleteSignalByZoneId(pid: string, zoneId: string): Promise<void> {
        return this._api.delete(`/api/1.0/signals/pid/${pid}/zoneId/${zoneId}`).then((res) => res.data)
    }



}