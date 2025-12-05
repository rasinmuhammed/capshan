import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Share2, Twitter } from 'lucide-react';

const Header: React.FC = () => {
    const handleShare = async () => {
        const shareData = {
            title: 'Capshan - Free AI Caption Generator',
            text: '🔥 Just found this insane caption generator! 100% free & private - your video never leaves your browser. Try it!',
            url: window.location.href,
        };

        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
            alert('Link copied to clipboard!');
        }
    };

    const handleTweet = () => {
        const text = encodeURIComponent('🔥 Just found this insane AI caption generator!\n\n✅ 100% FREE\n✅ 100% PRIVATE (runs in browser)\n✅ Word-by-word animations\n✅ Viral templates\n\nTry it:');
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
            <div className="max-w-[1800px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="w-8 h-8 rounded-lg bg-capshan-gold flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                    >
                        <Sparkles className="w-5 h-5 text-black fill-black" />
                    </motion.div>
                    <span className="text-xl font-black tracking-tighter text-white italic">
                        CAPSHAN
                    </span>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* Privacy Badge */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-400"
                    >
                        <Shield className="w-3 h-3" />
                        <span>100% Private</span>
                    </motion.div>

                    {/* Buy Me a Coffee Button */}
                    <motion.a
                        href="https://buymeacoffee.com/capshan"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFDD00]/10 border border-[#FFDD00]/30 text-xs font-bold text-[#FFDD00] hover:bg-[#FFDD00]/20 transition-colors"
                    >
                        <span>☕</span>
                        <span>Buy me a coffee</span>
                    </motion.a>

                    {/* Tweet Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTweet}
                        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 text-xs font-medium text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
                    >
                        <Twitter className="w-3 h-3" />
                        <span>Tweet</span>
                    </motion.button>

                    {/* Share Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShare}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-capshan-gold/10 border border-capshan-gold/20 text-xs font-bold text-capshan-gold hover:bg-capshan-gold/20 transition-colors"
                    >
                        <Share2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Share</span>
                    </motion.button>
                </div>
            </div>
        </header>
    );
};

export default Header;

