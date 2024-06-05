export interface Res {
    height: string,
    width: string
}

export const Resolution = new Map<string, Res>(
    [['1080', {
        height: '1920',
        width: '1080'
    }],
    ['720', {
        height: '1280',
        width: '720'
    }]]
)