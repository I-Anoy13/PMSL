import { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  activeStep: 'idle' | 'checking_limit' | 'limit_error' | 'loading' | 'playing' | 'crediting' | 'logging' | 'completed' | 'failed';
}

export default function CodeViewer({ activeStep }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const codeSnippet = `function handleAdWatch(userId) {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Check daily limit
      const today = new Date().toDateString();
      const adHistory = await db.collection('adWatchHistory')
        .where('userId', '==', userId)
        .where('timestamp', '>=', today)
        .get();
      
      if (adHistory.size >= 5) {
        reject(new Error('Daily ad limit reached'));
        return;
      }
      
      // 2. Load and play ad (using Unity Ads or AdMob)
      const adUnit = new RewardedAd();
      adUnit.loadAd();
      
      adUnit.onAdClosed(async () => {
        // 3. Credit coins
        await processCoinTransaction(userId, 15, 'earned', 'ad_watch', 'Watched rewarded video');
        
        // 4. Log ad watch
        await db.collection('adWatchHistory').add({
          userId,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          adType: 'rewarded',
          coinsEarned: 15
        });
        
        resolve();
      });
      
      adUnit.onAdFailed(() => {
        reject(new Error('Ad failed to load'));
      });
      
      adUnit.showAd();
    } catch (error) {
      reject(error);
    }
  });
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine line highlights based on current active execution step
  const isLineActive = (stepName: string) => {
    return activeStep === stepName;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full font-mono text-xs">
      {/* Code Editor Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-medium font-sans">handleAdWatch.ts</span>
          <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-mono">TypeScript</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="p-1.5 hover:bg-slate-800 rounded transition text-slate-400 hover:text-slate-200"
          title="Copy to clipboard"
          id="btn-copy-code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Code Content with step-by-step visual tracker */}
      <div className="p-4 overflow-y-auto flex-1 leading-relaxed text-slate-300 space-y-1 select-none select-text">
        <div className="text-purple-400">
          function <span className="text-blue-400">handleAdWatch</span>(userId: <span className="text-teal-400">string</span>) &#123;
        </div>
        <div className="pl-4 text-purple-400">
          return <span className="text-amber-400">new</span> <span className="text-blue-400">Promise</span>(<span className="text-amber-400">async</span> (resolve, reject) =&gt; &#123;
        </div>
        <div className="pl-8 text-purple-400">
          try &#123;
        </div>

        {/* Step 1: Check daily limit */}
        <div className={`transition-all duration-300 ${isLineActive('checking_limit') ? 'bg-cyan-500/10 border-l-2 border-cyan-400 pl-7 -ml-4 py-1 my-1 rounded-r' : 'pl-12'}`}>
          <div className="text-slate-500">// Check daily limit</div>
          <span className="text-purple-400">const</span> today = <span className="text-purple-400">new</span> <span className="text-blue-400">Date</span>().<span className="text-blue-400">toDateString</span>();<br />
          <span className="text-purple-400">const</span> adHistory = <span className="text-purple-400">await</span> db.<span className="text-blue-400">collection</span>(<span className="text-emerald-300">'adWatchHistory'</span>)<br />
          <span className="pl-4">.<span className="text-blue-400">where</span>(<span className="text-emerald-300">'userId'</span>, <span className="text-emerald-300">'=='</span>, userId)</span><br />
          <span className="pl-4">.<span className="text-blue-400">where</span>(<span className="text-emerald-300">'timestamp'</span>, <span className="text-emerald-300">'&gt;='</span>, today)</span><br />
          <span className="pl-4">.<span className="text-blue-400">get</span>();</span>
        </div>

        {/* Limit check error trigger */}
        <div className={`transition-all duration-300 ${isLineActive('limit_error') ? 'bg-red-500/15 border-l-2 border-red-500 pl-7 -ml-4 py-1 my-1 rounded-r' : 'pl-12'}`}>
          <span className="text-purple-400">if</span> (adHistory.size &gt;= <span className="text-amber-300">5</span>) &#123;<br />
          <span className="pl-4 text-blue-400">reject</span>(<span className="text-purple-400">new</span> <span className="text-blue-400">Error</span>(<span className="text-emerald-300">'Daily ad limit reached'</span>));<br />
          <span className="pl-4 text-purple-400">return</span>;<br />
          &#125;
        </div>

        {/* Step 2: Load and Play Ad */}
        <div className={`transition-all duration-300 ${isLineActive('loading') ? 'bg-amber-500/10 border-l-2 border-amber-400 pl-7 -ml-4 py-1 my-1 rounded-r' : 'pl-12'}`}>
          <div className="text-slate-500">// Load and play ad (using Unity Ads or AdMob)</div>
          <span className="text-purple-400">const</span> adUnit = <span className="text-purple-400">new</span> <span className="text-blue-400">RewardedAd</span>();<br />
          adUnit.<span className="text-blue-400">loadAd</span>();
        </div>

        {/* Step 3: Callback closed */}
        <div className="pl-12">
          adUnit.<span className="text-blue-400">onAdClosed</span>(<span className="text-amber-400">async</span> () =&gt; &#123;
        </div>

        {/* Step 3: Credit coins */}
        <div className={`transition-all duration-300 ${isLineActive('crediting') ? 'bg-yellow-500/15 border-l-2 border-yellow-400 pl-7 -ml-4 py-1 my-1 rounded-r' : 'pl-16'}`}>
          <div className="text-slate-500">// Credit coins</div>
          <span className="text-purple-400">await</span> <span className="text-blue-400">processCoinTransaction</span>(userId, <span className="text-amber-300">15</span>, <span className="text-emerald-300">'earned'</span>, <span className="text-emerald-300">'ad_watch'</span>, <span className="text-emerald-300">'Watched rewarded video'</span>);
        </div>

        {/* Step 4: Log ad watch */}
        <div className={`transition-all duration-300 ${isLineActive('logging') ? 'bg-indigo-500/10 border-l-2 border-indigo-400 pl-7 -ml-4 py-1 my-1 rounded-r' : 'pl-16'}`}>
          <div className="text-slate-500">// Log ad watch</div>
          <span className="text-purple-400">await</span> db.<span className="text-blue-400">collection</span>(<span className="text-emerald-300">'adWatchHistory'</span>).<span className="text-blue-400">add</span>(&#123;<br />
          <span className="pl-4">userId,</span><br />
          <span className="pl-4">timestamp: firebase.firestore.FieldValue.<span className="text-blue-400">serverTimestamp</span>(),</span><br />
          <span className="pl-4">adType: <span className="text-emerald-300">'rewarded'</span>,</span><br />
          <span className="pl-4">coinsEarned: <span className="text-amber-300">15</span></span><br />
          &#125;);
        </div>

        {/* Resolve and close */}
        <div className={`transition-all duration-300 ${isLineActive('completed') ? 'bg-emerald-500/10 border-l-2 border-emerald-400 pl-7 -ml-4 py-1 my-1 rounded-r' : 'pl-16'}`}>
          <span className="text-blue-400">resolve</span>();
        </div>
        <div className="pl-12">
          &#125;);
        </div>

        {/* Failed Handler */}
        <div className={`transition-all duration-300 ${isLineActive('failed') ? 'bg-rose-500/15 border-l-2 border-rose-500 pl-7 -ml-4 py-1 my-1 rounded-r' : 'pl-12'}`}>
          adUnit.<span className="text-blue-400">onAdFailed</span>(() =&gt; &#123;<br />
          <span className="pl-4 text-blue-400">reject</span>(<span className="text-purple-400">new</span> <span className="text-blue-400">Error</span>(<span className="text-emerald-300">'Ad failed to load'</span>));<br />
          &#125;);
        </div>

        {/* Show Ad and catch */}
        <div className={`transition-all duration-300 ${isLineActive('playing') ? 'bg-violet-500/15 border-l-2 border-violet-400 pl-7 -ml-4 py-1 my-1 rounded-r' : 'pl-12'}`}>
          adUnit.<span className="text-blue-400">showAd</span>();
        </div>
        <div className="pl-8">
          &#125; <span className="text-purple-400">catch</span> (error) &#123;
        </div>
        <div className="pl-12 text-blue-400">
          reject(error);
        </div>
        <div className="pl-8">
          &#125;
        </div>
        <div className="pl-4 text-purple-400">
          &#125;);
        </div>
        <div className="text-purple-400">
          &#125;
        </div>
      </div>

      {/* Code Viewer Footer / Execution status tracker */}
      <div className="bg-slate-950 p-3 border-t border-slate-800 text-xs flex items-center justify-between">
        <span className="text-slate-400">Execution Phase:</span>
        <div className="flex items-center gap-1.5 font-sans">
          <span className={`w-2.5 h-2.5 rounded-full ${
            activeStep === 'idle' ? 'bg-slate-500 animate-pulse' :
            activeStep === 'checking_limit' ? 'bg-cyan-400 animate-pulse' :
            activeStep === 'limit_error' ? 'bg-red-500 animate-bounce' :
            activeStep === 'loading' ? 'bg-amber-400 animate-spin' :
            activeStep === 'playing' ? 'bg-violet-400 animate-pulse' :
            activeStep === 'crediting' ? 'bg-yellow-400 animate-pulse' :
            activeStep === 'logging' ? 'bg-indigo-400 animate-pulse' :
            activeStep === 'completed' ? 'bg-emerald-400' :
            'bg-rose-500'
          }`} />
          <span className={`font-semibold ${
            activeStep === 'idle' ? 'text-slate-400' :
            activeStep === 'checking_limit' ? 'text-cyan-400' :
            activeStep === 'limit_error' ? 'text-red-400' :
            activeStep === 'loading' ? 'text-amber-400' :
            activeStep === 'playing' ? 'text-violet-400' :
            activeStep === 'crediting' ? 'text-yellow-400' :
            activeStep === 'logging' ? 'text-indigo-400' :
            activeStep === 'completed' ? 'text-emerald-400' :
            'text-rose-400'
          }`}>
            {activeStep === 'idle' && 'Idle (Awaiting watch trigger)'}
            {activeStep === 'checking_limit' && '1. Checking Daily Limit (db.collection)'}
            {activeStep === 'limit_error' && 'Error: Daily ad limit (5) reached!'}
            {activeStep === 'loading' && '2. Loading Ad (RewardedAd.loadAd)'}
            {activeStep === 'playing' && 'Playing Ad (RewardedAd.showAd)'}
            {activeStep === 'crediting' && '3. Crediting 15 Coins (processCoinTransaction)'}
            {activeStep === 'logging' && '4. Logging History (db.collection.add)'}
            {activeStep === 'completed' && 'Promise Resolved successfully!'}
            {activeStep === 'failed' && 'Promise Rejected: Ad failed to load.'}
          </span>
        </div>
      </div>
    </div>
  );
}
