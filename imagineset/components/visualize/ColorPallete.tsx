export function ColorPallete({hexCodes}: {hexCodes: string[]}) {
    return (
        <div style={{ display: 'inline-flex', marginLeft: '3px' }}>
            {hexCodes.map((color) => <div style={{ 'backgroundColor': color, width: '10px', height: '10px' }}></div>)}
        </div>
    )
}