import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Type,
    Palette,
    Layout,
    Sparkles,
    X,
    ChevronUp,
    ChevronDown,
    Eye,
    Layers,
    Wand2,
    PenTool
} from 'lucide-react';
import { useAppStore, STYLE_TEMPLATES } from '../../store/app.store';

const FONT_FAMILIES = [
    'Inter',
    'Montserrat',
    'Bebas Neue',
    'Outfit',
    'Poppins',
    'Roboto',
    'Arial',
    'Pinyon Script',
    'Georgia',
];

const DISPLAY_MODES = [
    { id: 'flow', label: 'Flow', desc: 'All words visible' },
    { id: 'word-by-word', label: 'Word by Word', desc: 'Reveal one at a time' },
    { id: 'typewriter', label: 'Typewriter', desc: 'Typing animation' },
    { id: 'line-by-line', label: 'Line by Line', desc: 'Show full lines' },
];

const ANIMATIONS = [
    { id: 'none', label: 'None' },
    { id: 'fade', label: 'Fade' },
    { id: 'slide', label: 'Slide' },
    { id: 'pop', label: 'Pop' },
    { id: 'bounce', label: 'Bounce' },
    { id: 'scale', label: 'Scale' },
];

// Color Picker Component
const ColorInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{label}</span>
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-2 border-zinc-700"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs font-mono"
            />
        </div>
    </div>
);

// Slider Component
const SliderInput: React.FC<{ label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }> =
    ({ label, value, min, max, step = 1, unit = '', onChange }) => (
        <div className="space-y-2">
            <div className="flex justify-between">
                <span className="text-xs text-zinc-400">{label}</span>
                <span className="text-xs text-capshan-gold font-bold">{value}{unit}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-capshan-gold"
            />
        </div>
    );

// Toggle Component
const Toggle: React.FC<{ label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, desc, value, onChange }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <span className="text-sm font-medium text-white">{label}</span>
            {desc && <p className="text-xs text-zinc-500">{desc}</p>}
        </div>
        <button
            onClick={() => onChange(!value)}
            className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-capshan-gold' : 'bg-zinc-700'}`}
        >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

// Section Header
const Section: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900/50 border-b border-zinc-800">
            {icon}
            <span className="text-xs font-bold text-white uppercase tracking-wide">{title}</span>
        </div>
        <div className="p-4 space-y-3">
            {children}
        </div>
    </div>
);

const StylePanel: React.FC = () => {
    const { captionStyle, setCaptionStyle, showStylePanel, setShowStylePanel } = useAppStore();
    const [activeTab, setActiveTab] = useState<'templates' | 'display' | 'text' | 'active' | 'effects'>('templates');
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);

    const applyTemplate = (templateId: string) => {
        const template = STYLE_TEMPLATES.find(t => t.id === templateId);
        if (template) {
            setCaptionStyle({ ...template.style, templateId });
        }
    };

    if (!showStylePanel) {
        return (
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowStylePanel(true)}
                className="fixed bottom-6 right-6 z-40 bg-capshan-gold text-black p-4 rounded-full shadow-lg glow-gold"
            >
                <Palette className="w-6 h-6" />
            </motion.button>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                onClick={() => setShowStylePanel(false)}
            />

            <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`
                    fixed z-50 bg-black/95 backdrop-blur-xl border-zinc-800 shadow-2xl
                    lg:top-20 lg:right-6 lg:bottom-6 lg:w-[380px] lg:rounded-2xl lg:border lg:h-[calc(100vh-6.5rem)]
                    bottom-0 left-0 right-0 rounded-t-2xl border-t max-h-[85vh] overflow-hidden flex flex-col
                    ${isMobileExpanded ? 'h-[85vh]' : 'h-[50vh]'}
                `}>
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-zinc-800 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-capshan-gold" />
                        <h3 className="font-black text-sm uppercase tracking-tight">Style Studio</h3>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                            className="p-2 hover:bg-zinc-800 rounded-lg lg:hidden"
                        >
                            {isMobileExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setShowStylePanel(false)}
                            className="p-2 hover:bg-zinc-800 rounded-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tabs - Scrollable */}
                <div className="flex overflow-x-auto border-b border-zinc-800 flex-shrink-0 hide-scrollbar">
                    {[
                        { id: 'templates', icon: <Sparkles className="w-4 h-4" />, label: 'Styles' },
                        { id: 'display', icon: <Eye className="w-4 h-4" />, label: 'Display' },
                        { id: 'text', icon: <Type className="w-4 h-4" />, label: 'Text' },
                        { id: 'active', icon: <Layers className="w-4 h-4" />, label: 'Active' },
                        { id: 'effects', icon: <PenTool className="w-4 h-4" />, label: 'Effects' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 min-w-[70px] flex flex-col items-center gap-1 py-2.5 px-2 transition-all text-xs ${activeTab === tab.id
                                ? 'text-capshan-gold border-b-2 border-capshan-gold bg-capshan-gold/5'
                                : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            {tab.icon}
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

                    {/* TEMPLATES TAB */}
                    {activeTab === 'templates' && (
                        <div className="space-y-4">
                            {/* Quick Text Case Toggle - Most Important Setting */}
                            <div className="border border-zinc-700 rounded-xl p-3 bg-zinc-900/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-white uppercase tracking-wide">Text Case</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {[
                                        { id: 'none', label: 'Normal', preview: 'Aa' },
                                        { id: 'uppercase', label: 'ALL CAPS', preview: 'AA' },
                                        { id: 'lowercase', label: 'lower', preview: 'aa' },
                                        { id: 'capitalize', label: 'Title', preview: 'Ab' },
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setCaptionStyle({ textTransform: t.id as any })}
                                            className={`py-2.5 px-2 rounded-lg text-center transition-all ${captionStyle.textTransform === t.id
                                                    ? 'bg-capshan-gold text-black'
                                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                                }`}
                                        >
                                            <div className="text-lg font-bold">{t.preview}</div>
                                            <div className="text-[9px] mt-0.5">{t.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Word Color - Quick Access */}
                            <div className="border border-zinc-700 rounded-xl p-3 bg-zinc-900/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-white uppercase tracking-wide">Highlight Color</span>
                                    <div className="flex items-center gap-1">
                                        <div
                                            className="w-5 h-5 rounded border border-zinc-600"
                                            style={{ backgroundColor: captionStyle.activeWordColor }}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-1.5 flex-wrap">
                                    {[
                                        '#FFD700', // Gold
                                        '#00FF88', // Green
                                        '#FF6B9D', // Pink
                                        '#00D4FF', // Cyan
                                        '#FF6B6B', // Red
                                        '#A78BFA', // Purple
                                        '#F97316', // Orange
                                        '#ffffff', // White
                                    ].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setCaptionStyle({ activeWordColor: color, activeWordBackgroundColor: color })}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all ${captionStyle.activeWordColor === color
                                                    ? 'border-white scale-110'
                                                    : 'border-transparent hover:border-zinc-500'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={captionStyle.activeWordColor}
                                        onChange={(e) => setCaptionStyle({ activeWordColor: e.target.value, activeWordBackgroundColor: e.target.value })}
                                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
                                        title="Custom color"
                                    />
                                </div>
                            </div>

                            {/* Viral Caption Presets */}
                            <div className="border border-capshan-gold/30 rounded-xl p-3 bg-gradient-to-br from-capshan-gold/5 to-transparent">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4 text-capshan-gold" />
                                    <span className="text-xs font-bold text-capshan-gold uppercase tracking-wide">Animation Style</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => applyTemplate('hormozi')}
                                        className={`p-3 rounded-xl border text-center transition-all ${captionStyle.templateId === 'hormozi' || captionStyle.templateId === 'viral' || captionStyle.templateId === 'neon'
                                                ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                                : 'border-zinc-700 bg-zinc-900/50 hover:border-red-500/50'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">🔥</div>
                                        <div className="font-black text-xs text-white">HORMOZI</div>
                                        <div className="text-[10px] text-zinc-500 mt-0.5">Pop-in</div>
                                    </button>
                                    <button
                                        onClick={() => applyTemplate('aesthetic')}
                                        className={`p-3 rounded-xl border text-center transition-all ${captionStyle.templateId === 'aesthetic'
                                                ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                                                : 'border-zinc-700 bg-zinc-900/50 hover:border-cyan-400/50'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">🎤</div>
                                        <div className="font-black text-xs text-white">KARAOKE</div>
                                        <div className="text-[10px] text-zinc-500 mt-0.5">Fill Effect</div>
                                    </button>
                                    <button
                                        onClick={() => applyTemplate('minimal')}
                                        className={`p-3 rounded-xl border text-center transition-all ${captionStyle.templateId === 'minimal' || captionStyle.templateId === 'classic'
                                                ? 'border-pink-400 bg-pink-400/10 shadow-[0_0_15px_rgba(244,114,182,0.3)]'
                                                : 'border-zinc-700 bg-zinc-900/50 hover:border-pink-400/50'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">📦</div>
                                        <div className="font-black text-xs text-white">VEED</div>
                                        <div className="text-[10px] text-zinc-500 mt-0.5">Box Slide</div>
                                    </button>
                                </div>
                            </div>

                            {/* Style Templates */}
                            <div>
                                <p className="text-xs text-zinc-500 mb-3">Fine-tune with style presets</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {STYLE_TEMPLATES.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => applyTemplate(template.id)}
                                            className={`p-3 rounded-xl border text-left transition-all ${captionStyle.templateId === template.id
                                                ? 'border-capshan-gold bg-capshan-gold/10 glow-gold-sm'
                                                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{template.preview}</div>
                                            <div className="font-bold text-sm text-white">{template.name}</div>
                                            <div className="text-xs text-zinc-500 mt-1" style={{ fontFamily: template.style.fontFamily }}>
                                                {template.style.fontFamily}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DISPLAY TAB */}
                    {activeTab === 'display' && (
                        <div className="space-y-4">
                            <Section title="Display Mode" icon={<Eye className="w-4 h-4 text-capshan-gold" />}>
                                <div className="grid grid-cols-2 gap-2">
                                    {DISPLAY_MODES.map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setCaptionStyle({ displayMode: mode.id as any })}
                                            className={`p-3 rounded-lg border text-left transition-all ${captionStyle.displayMode === mode.id
                                                ? 'border-capshan-gold bg-capshan-gold/10'
                                                : 'border-zinc-800 hover:border-zinc-700'
                                                }`}
                                        >
                                            <div className="font-semibold text-sm text-white">{mode.label}</div>
                                            <div className="text-xs text-zinc-500">{mode.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </Section>

                            <Section title="Animation" icon={<Sparkles className="w-4 h-4 text-capshan-gold" />}>
                                <div className="grid grid-cols-3 gap-2">
                                    {ANIMATIONS.map((anim) => (
                                        <button
                                            key={anim.id}
                                            onClick={() => setCaptionStyle({ animation: anim.id as any })}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${captionStyle.animation === anim.id
                                                ? 'bg-capshan-gold text-black'
                                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                                }`}
                                        >
                                            {anim.label}
                                        </button>
                                    ))}
                                </div>
                                <SliderInput
                                    label="Animation Speed"
                                    value={captionStyle.animationSpeed}
                                    min={0.5}
                                    max={2}
                                    step={0.1}
                                    unit="x"
                                    onChange={(v) => setCaptionStyle({ animationSpeed: v })}
                                />
                            </Section>

                            <Section title="Layout" icon={<Layout className="w-4 h-4 text-capshan-gold" />}>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <span className="text-xs text-zinc-400 w-20">Lines</span>
                                        <div className="flex gap-1 flex-1">
                                            {[1, 2, 3].map((n) => (
                                                <button
                                                    key={n}
                                                    onClick={() => setCaptionStyle({ linesPerCaption: n })}
                                                    className={`flex-1 py-2 rounded text-sm font-bold ${captionStyle.linesPerCaption === n
                                                        ? 'bg-capshan-gold text-black'
                                                        : 'bg-zinc-800 text-zinc-400'
                                                        }`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <SliderInput
                                        label="Words per Line"
                                        value={captionStyle.wordsPerLine}
                                        min={2}
                                        max={8}
                                        onChange={(v) => setCaptionStyle({ wordsPerLine: v })}
                                    />
                                    <div className="flex gap-2">
                                        <span className="text-xs text-zinc-400 w-20">Position</span>
                                        <div className="flex gap-1 flex-1">
                                            {['top', 'center', 'bottom'].map((pos) => (
                                                <button
                                                    key={pos}
                                                    onClick={() => setCaptionStyle({ position: pos as any })}
                                                    className={`flex-1 py-2 rounded text-xs font-medium capitalize ${captionStyle.position === pos
                                                        ? 'bg-capshan-gold text-black'
                                                        : 'bg-zinc-800 text-zinc-400'
                                                        }`}
                                                >
                                                    {pos}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Section>
                        </div>
                    )}

                    {/* TEXT TAB */}
                    {activeTab === 'text' && (
                        <div className="space-y-4">
                            <Section title="Font" icon={<Type className="w-4 h-4 text-capshan-gold" />}>
                                <div className="space-y-3">
                                    <select
                                        value={captionStyle.fontFamily}
                                        onChange={(e) => setCaptionStyle({ fontFamily: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm"
                                        style={{ fontFamily: captionStyle.fontFamily }}
                                    >
                                        {FONT_FAMILIES.map((font) => (
                                            <option key={font} value={font} style={{ fontFamily: font }}>
                                                {font}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="grid grid-cols-2 gap-3">
                                        <SliderInput
                                            label="Size"
                                            value={captionStyle.fontSize}
                                            min={24}
                                            max={80}
                                            unit="px"
                                            onChange={(v) => setCaptionStyle({ fontSize: v })}
                                        />
                                        <SliderInput
                                            label="Weight"
                                            value={captionStyle.fontWeight}
                                            min={400}
                                            max={900}
                                            step={100}
                                            onChange={(v) => setCaptionStyle({ fontWeight: v })}
                                        />
                                    </div>
                                    <ColorInput
                                        label="Text Color"
                                        value={captionStyle.color}
                                        onChange={(v) => setCaptionStyle({ color: v })}
                                    />
                                    <div className="flex gap-2">
                                        <span className="text-xs text-zinc-400 w-24">Transform</span>
                                        <div className="flex gap-1 flex-1">
                                            {['none', 'uppercase', 'capitalize'].map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setCaptionStyle({ textTransform: t as any })}
                                                    className={`flex-1 py-1.5 rounded text-xs font-medium ${captionStyle.textTransform === t
                                                        ? 'bg-capshan-gold text-black'
                                                        : 'bg-zinc-800 text-zinc-400'
                                                        }`}
                                                >
                                                    {t === 'none' ? 'Aa' : t === 'uppercase' ? 'AA' : 'Aa'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            <Section title="Stroke" icon={<PenTool className="w-4 h-4 text-capshan-gold" />}>
                                <Toggle
                                    label="Enable Stroke"
                                    desc="Outline around text"
                                    value={captionStyle.strokeEnabled}
                                    onChange={(v) => setCaptionStyle({ strokeEnabled: v })}
                                />
                                {captionStyle.strokeEnabled && (
                                    <div className="space-y-3 pt-2">
                                        <ColorInput
                                            label="Stroke Color"
                                            value={captionStyle.strokeColor}
                                            onChange={(v) => setCaptionStyle({ strokeColor: v })}
                                        />
                                        <SliderInput
                                            label="Stroke Width"
                                            value={captionStyle.strokeWidth}
                                            min={1}
                                            max={8}
                                            unit="px"
                                            onChange={(v) => setCaptionStyle({ strokeWidth: v })}
                                        />
                                    </div>
                                )}
                            </Section>

                            <Section title="Background" icon={<Layers className="w-4 h-4 text-capshan-gold" />}>
                                <Toggle
                                    label="Background Box"
                                    value={captionStyle.showBackground}
                                    onChange={(v) => setCaptionStyle({ showBackground: v })}
                                />
                                {captionStyle.showBackground && (
                                    <div className="space-y-3 pt-2">
                                        <ColorInput
                                            label="Color"
                                            value={captionStyle.backgroundColor}
                                            onChange={(v) => setCaptionStyle({ backgroundColor: v })}
                                        />
                                        <SliderInput
                                            label="Opacity"
                                            value={captionStyle.backgroundOpacity}
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            unit=""
                                            onChange={(v) => setCaptionStyle({ backgroundOpacity: v })}
                                        />
                                        <SliderInput
                                            label="Radius"
                                            value={captionStyle.backgroundRadius}
                                            min={0}
                                            max={20}
                                            unit="px"
                                            onChange={(v) => setCaptionStyle({ backgroundRadius: v })}
                                        />
                                    </div>
                                )}
                            </Section>
                        </div>
                    )}

                    {/* ACTIVE WORD TAB */}
                    {activeTab === 'active' && (
                        <div className="space-y-4">
                            <Section title="Active Word Style" icon={<Sparkles className="w-4 h-4 text-capshan-gold" />}>
                                <div className="space-y-3">
                                    <ColorInput
                                        label="Color"
                                        value={captionStyle.activeWordColor}
                                        onChange={(v) => setCaptionStyle({ activeWordColor: v })}
                                    />
                                    <select
                                        value={captionStyle.activeWordFontFamily}
                                        onChange={(e) => setCaptionStyle({ activeWordFontFamily: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm"
                                    >
                                        {FONT_FAMILIES.map((font) => (
                                            <option key={font} value={font}>{font}</option>
                                        ))}
                                    </select>
                                    <div className="grid grid-cols-2 gap-3">
                                        <SliderInput
                                            label="Size"
                                            value={captionStyle.activeWordFontSize}
                                            min={24}
                                            max={80}
                                            unit="px"
                                            onChange={(v) => setCaptionStyle({ activeWordFontSize: v })}
                                        />
                                        <SliderInput
                                            label="Scale"
                                            value={captionStyle.activeWordScale}
                                            min={1}
                                            max={1.5}
                                            step={0.05}
                                            unit="x"
                                            onChange={(v) => setCaptionStyle({ activeWordScale: v })}
                                        />
                                    </div>
                                    <Toggle
                                        label="Background"
                                        desc="Box behind active word"
                                        value={captionStyle.activeWordBackground}
                                        onChange={(v) => setCaptionStyle({ activeWordBackground: v })}
                                    />
                                    {captionStyle.activeWordBackground && (
                                        <ColorInput
                                            label="Background Color"
                                            value={captionStyle.activeWordBackgroundColor}
                                            onChange={(v) => setCaptionStyle({ activeWordBackgroundColor: v })}
                                        />
                                    )}
                                </div>
                            </Section>

                            <Section title="Auto-Emphasis" icon={<Wand2 className="w-4 h-4 text-capshan-gold" />}>
                                <Toggle
                                    label="Auto-Emphasize"
                                    desc="Highlight CAPS, numbers & vibes"
                                    value={captionStyle.autoEmphasize}
                                    onChange={(v) => {
                                        setCaptionStyle({ autoEmphasize: v });
                                        if (v) useAppStore.getState().applyAutoEmphasis();
                                    }}
                                />
                                {captionStyle.autoEmphasize && (
                                    <div className="space-y-3 pt-2">
                                        <ColorInput
                                            label="Emphasis Color"
                                            value={captionStyle.emphasisColor}
                                            onChange={(v) => setCaptionStyle({ emphasisColor: v })}
                                        />
                                        <select
                                            value={captionStyle.emphasisFontFamily}
                                            onChange={(e) => setCaptionStyle({ emphasisFontFamily: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm"
                                        >
                                            {FONT_FAMILIES.map((font) => (
                                                <option key={font} value={font}>{font}</option>
                                            ))}
                                        </select>
                                        <SliderInput
                                            label="Size"
                                            value={captionStyle.emphasisFontSize}
                                            min={24}
                                            max={80}
                                            unit="px"
                                            onChange={(v) => setCaptionStyle({ emphasisFontSize: v })}
                                        />
                                    </div>
                                )}
                            </Section>
                        </div>
                    )}

                    {/* EFFECTS TAB */}
                    {activeTab === 'effects' && (
                        <div className="space-y-4">
                            <Section title="Glow" icon={<Sparkles className="w-4 h-4 text-capshan-gold" />}>
                                <Toggle
                                    label="Enable Glow"
                                    desc="Neon glow effect"
                                    value={captionStyle.glowEnabled}
                                    onChange={(v) => setCaptionStyle({ glowEnabled: v })}
                                />
                                {captionStyle.glowEnabled && (
                                    <div className="space-y-3 pt-2">
                                        <ColorInput
                                            label="Glow Color"
                                            value={captionStyle.glowColor}
                                            onChange={(v) => setCaptionStyle({ glowColor: v })}
                                        />
                                        <SliderInput
                                            label="Intensity"
                                            value={captionStyle.glowIntensity}
                                            min={5}
                                            max={50}
                                            unit="px"
                                            onChange={(v) => setCaptionStyle({ glowIntensity: v })}
                                        />
                                    </div>
                                )}
                            </Section>

                            <Section title="Shadow" icon={<Layers className="w-4 h-4 text-capshan-gold" />}>
                                <Toggle
                                    label="Enable Shadow"
                                    desc="Drop shadow for depth"
                                    value={captionStyle.shadowEnabled}
                                    onChange={(v) => setCaptionStyle({ shadowEnabled: v })}
                                />
                                {captionStyle.shadowEnabled && (
                                    <div className="space-y-3 pt-2">
                                        <ColorInput
                                            label="Shadow Color"
                                            value={captionStyle.shadowColor}
                                            onChange={(v) => setCaptionStyle({ shadowColor: v })}
                                        />
                                        <SliderInput
                                            label="Blur"
                                            value={captionStyle.shadowBlur}
                                            min={0}
                                            max={30}
                                            unit="px"
                                            onChange={(v) => setCaptionStyle({ shadowBlur: v })}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <SliderInput
                                                label="Offset X"
                                                value={captionStyle.shadowOffsetX}
                                                min={-10}
                                                max={10}
                                                unit="px"
                                                onChange={(v) => setCaptionStyle({ shadowOffsetX: v })}
                                            />
                                            <SliderInput
                                                label="Offset Y"
                                                value={captionStyle.shadowOffsetY}
                                                min={-10}
                                                max={10}
                                                unit="px"
                                                onChange={(v) => setCaptionStyle({ shadowOffsetY: v })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </Section>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default StylePanel;
