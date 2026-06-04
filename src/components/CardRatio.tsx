import { useState } from 'react';

interface Props {
    ratioW: number;
    ratioH: number;
    setRatioW: (val: number) => void;
    setRatioH: (val: number) => void;
}

export default function CardRatio({ ratioW, ratioH, setRatioW, setRatioH }: Props) {
    const [wStr, setWStr] = useState(String(ratioW));
    const [hStr, setHStr] = useState(String(ratioH));

    const handleChange = (val: string, setStr: (s: string) => void, setRatio: (n: number) => void) => {
        setStr(val);
        const n = parseInt(val);
        if (n >= 1) setRatio(n);
    };

    const handleBlur = (str: string, fallback: number, setStr: (s: string) => void) => {
        if (!(parseInt(str) >= 1)) setStr(String(fallback));
    };

    return (
        <div className="ratio-input">
            <label>Card ratio</label>
            <input
                type="text"
                value={wStr}
                onKeyDown={e => /[^0-9]/.test(e.key) && e.key.length === 1 && e.preventDefault()}
                onChange={e => handleChange(e.target.value, setWStr, setRatioW)}
                onBlur={() => handleBlur(wStr, ratioW, setWStr)}
            />
            <span>:</span>
            <input
                type="text"
                value={hStr}
                onKeyDown={e => /[^0-9]/.test(e.key) && e.key.length === 1 && e.preventDefault()}
                onChange={e => handleChange(e.target.value, setHStr, setRatioH)}
                onBlur={() => handleBlur(hStr, ratioH, setHStr)}
            />
            <label>Default: Pokémon, One Piece, Magic: The Gathering, etc.</label>
        </div>
    );
}
