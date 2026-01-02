
import React, { useState, useMemo } from 'react';
import { Motorcycle, ViewState, Category } from './types';
import { KYMCO_MODELS } from './constants';
import ModelCard from './components/ModelCard';
import Navigation from './components/Navigation';
import ComparisonView from './components/ComparisonView';
import { getAIRecommendation } from './services/geminiService';
import { ChevronLeft, Search, Info, Send, Bot, MessageCircle, Scale, Share2, Github, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState | 'guide'>('list');
  const [selectedModel, setSelectedModel] = useState<Motorcycle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | '全部'>('全部');
  const [compareList, setCompareList] = useState<string[]>([]);
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: '你好！我是光阳智选顾问。你可以根据你的用途、预算问我任何关于光阳车型的问题。' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const filteredModels = useMemo(() => {
    return KYMCO_MODELS.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.series.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === '全部' || m.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleModelClick = (model: Motorcycle) => {
    setSelectedModel(model);
    setView('detail');
  };

  const toggleCompare = (id: string) => {
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    const response = await getAIRecommendation(userMsg);
    setChatHistory(prev => [...prev, { role: 'bot', text: response }]);
    setIsTyping(false);
  };

  const renderContent = () => {
    if (view === 'guide') {
      return (
        <div className="pb-24 p-6 bg-white min-h-screen animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => setView('list')} className="p-2 bg-gray-100 rounded-full"><ChevronLeft /></button>
            <h2 className="text-xl font-black">部署与集成指南</h2>
          </div>
          
          <section className="space-y-6">
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><Github size={18}/> 第一步：GitHub 部署</h3>
              <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside font-medium">
                <li>在 GitHub 上创建名为 <code className="bg-blue-200 px-1 rounded">kymco-db</code> 的仓库。</li>
                <li>上传此项目的所有源码文件。</li>
                <li>前往 Settings -> Pages，选择分支部署。</li>
              </ol>
            </div>

            <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
              <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2"><MessageCircle size={18}/> 第二步：集成微信小程序</h3>
              <p className="text-sm text-green-700 font-medium mb-3">由于本应用是 H5 应用，你可以通过小程序的 <code className="bg-green-200 px-1 rounded">web-view</code> 快速封装：</p>
              <div className="bg-black/5 p-4 rounded-xl font-mono text-xs text-green-900 mb-2">
                &lt;web-view src="https://你的用户名.github.io/kymco-db/" /&gt;
              </div>
              <p className="text-xs text-green-600 italic">* 注意：需要在微信小程序后台添加 GitHub 的域名白名单。</p>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><Share2 size={18}/> 优势</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>无需购买服务器，完全免费托管。</li>
                <li>H5 页面实时更新，小程序无需重新发布。</li>
                <li>完美适配微信分享与内置浏览器。</li>
              </ul>
            </div>
          </section>
        </div>
      );
    }

    if (view === 'detail' && selectedModel) {
      return (
        <div className="pb-24 animate-in fade-in slide-in-from-right duration-300">
          <div className="relative">
            <button onClick={() => setView('list')} className="absolute top-4 left-4 z-10 bg-black/20 backdrop-blur-md p-2 rounded-full text-white"><ChevronLeft size={24} /></button>
            <img src={selectedModel.image} className="w-full aspect-[4/3] object-cover" />
          </div>
          <div className="p-6 bg-white -mt-6 rounded-t-3xl relative z-10 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900 leading-tight">{selectedModel.name}</h1>
                <p className="text-gray-500 font-medium">{selectedModel.series} · {selectedModel.category}</p>
              </div>
              <div className="text-right">
                <span className="text-blue-600 text-2xl font-black italic">¥{selectedModel.price}</span>
              </div>
            </div>
            <button onClick={() => toggleCompare(selectedModel.id)} className={`w-full py-4 rounded-xl font-bold mb-8 flex items-center justify-center gap-2 transition-all ${compareList.includes(selectedModel.id) ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-900 text-white'}`}><Scale size={18} />{compareList.includes(selectedModel.id) ? '已加入对比' : '加入对比'}</button>
            <div className="mb-8"><h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">产品简述</h2><p className="text-gray-700 leading-relaxed font-medium">{selectedModel.description}</p></div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Info size={20} className="text-blue-600" /> 技术参数详解</h2>
            <div className="space-y-1 bg-gray-50 rounded-2xl p-1 border border-gray-100">
              {Object.entries(selectedModel.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between bg-white p-4 rounded-xl"><span className="text-gray-500 text-sm">{key}</span><span className="text-gray-900 font-bold text-sm text-right ml-4">{value}</span></div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (view === 'compare') {
      return <ComparisonView initialIds={compareList} onIdsChange={setCompareList} />;
    }

    if (view === 'ai') {
      return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50">
          <div className="p-4 border-b bg-white flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white"><Bot size={24} /></div>
            <div><h2 className="text-base font-bold text-gray-900">光阳智选顾问</h2><p className="text-[10px] text-gray-400 font-medium">为您匹配最合适的座驾</p></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((chat, idx) => (
              <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${chat.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 font-medium'}`}>{chat.text}</div>
              </div>
            ))}
            {isTyping && <div className="flex justify-start"><div className="bg-white p-4 rounded-2xl shadow-sm animate-pulse">...</div></div>}
          </div>
          <div className="p-4 bg-white border-t flex gap-2 pb-safe-bottom">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="描述您的需求..." className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 text-sm outline-none" />
            <button onClick={handleSendMessage} disabled={!chatInput.trim() || isTyping} className="bg-blue-600 text-white p-3 rounded-full disabled:opacity-50"><Send size={20} /></button>
          </div>
        </div>
      );
    }

    return (
      <div className="pb-24">
        <header className="px-6 pt-10 pb-6 bg-white flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">KYMCO</h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Motorcycle Database</p>
          </div>
          <button onClick={() => setView('guide')} className="p-2 bg-gray-50 text-gray-400 rounded-xl border border-gray-100"><ExternalLink size={20} /></button>
        </header>
        <div className="px-4 sticky top-0 z-20 bg-white pb-4"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="搜索车型..." className="w-full bg-gray-100 border-none rounded-2xl py-3.5 pl-11 pr-4 font-medium text-sm focus:ring-2 focus:ring-blue-600 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div>
        <div className="px-4 mt-6 flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {['全部', ...Object.values(Category)].map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat as any)} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-gray-500 border border-gray-100'}`}>{cat}</button>
          ))}
        </div>
        <div className="px-4 mt-6 space-y-4">
          {filteredModels.map(model => <ModelCard key={model.id} motorcycle={model} onClick={handleModelClick} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative shadow-2xl overflow-x-hidden">
      {renderContent()}
      <Navigation currentView={view === 'guide' ? 'list' : view as ViewState} onNavigate={(v) => { setView(v); setSelectedModel(null); }} />
      {view !== 'compare' && view !== 'guide' && compareList.length > 0 && (
        <div onClick={() => setView('compare')} className="fixed bottom-24 right-6 bg-gray-900 text-white p-4 rounded-full shadow-xl flex items-center justify-center cursor-pointer active:scale-90 transition-transform z-40">
          <Scale size={24} /><span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{compareList.length}</span>
        </div>
      )}
    </div>
  );
};

export default App;
