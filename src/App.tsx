/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { 
  Star, 
  Shirt, 
  TrendingUp, 
  ShieldCheck, 
  Instagram, 
  ChevronRight,
  Tag,
  Truck
} from 'lucide-react';

type LeadFormData = {
  ownerName: string;
  storeName: string;
  email: string;
  whatsapp: string;
  cnpj: string;
  cityState: string;
  instagram: string;
  brandsSold: string;
  storeType: string;
  saleType: string;
  cnpjAge: string;
};

const initialFormData: LeadFormData = {
  ownerName: '',
  storeName: '',
  email: '',
  whatsapp: '',
  cnpj: '',
  cityState: '',
  instagram: '',
  brandsSold: '',
  storeType: '',
  saleType: '',
  cnpjAge: ''
};

const calculateLeadScore = (data: LeadFormData) => {
  let score = 0;

  if (data.ownerName && data.storeName && data.email && data.whatsapp && data.cnpj && data.cityState) {
    score += 20;
  }

  const storeTypeScore: Record<string, number> = {
    Boutique: 15,
    Multimarcas: 20,
    'Revendedor Autônomo': 5,
    'Loja de Shopping': 25,
    'Loja Online': 10,
    Magazine: 25
  };

  const saleTypeScore: Record<string, number> = {
    Atacado: 25,
    Varejo: 10
  };

  const cnpjAgeScore: Record<string, number> = {
    'Menos de 1 ano': 5,
    'De 1 a 2 anos': 10,
    'De 2 a 5 anos': 20,
    'Mais de 5 anos': 25
  };

  score += storeTypeScore[data.storeType] ?? 0;
  score += saleTypeScore[data.saleType] ?? 0;
  score += cnpjAgeScore[data.cnpjAge] ?? 0;
  score += data.brandsSold.trim() ? 5 : 0;
  score += data.instagram.trim() ? 5 : 0;
  score += data.cnpj.length >= 14 ? 10 : 0;
  score += data.whatsapp.length >= 10 ? 10 : 0;

  return Math.min(score, 100);
};

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false },
  transition: { duration: 0.8 }
};

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }));
  };

  const handleDigitsOnlyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value.replace(/\D/g, '')
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const leadScore = calculateLeadScore(formData);
    const payload = {
      ...formData,
      pageurl: window.location.href,
      leadScore,
      submittedAt: new Date().toISOString()
    };

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API respondeu com status ${response.status}`);
      }

      setFormData(initialFormData);
      setSubmitMessage('Obrigado! Em breve nossa equipe entrará em contato.');
      alert('Obrigado! Em breve nossa equipe entrará em contato.');
    } catch (error) {
      console.error('Erro ao enviar lead para o n8n:', error);
      setSubmitMessage('Não foi possível enviar sua solicitação agora. Tente novamente em instantes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:pl-56 lg:pr-20 transition-all duration-300 ${
        isScrolled ? 'bg-[#0A1A3A]/95 backdrop-blur-md pt-3 pb-3 shadow-xl' : 'bg-transparent pt-4 pb-8'
      }`}>
        <img 
          src="https://frwfcibbvbj5zog7.public.blob.vercel-storage.com/geral/logo-branca-1779825694567.webp" 
          alt="Moda Criativa Logo" 
          className={`transition-all duration-300 object-contain ${
            isScrolled ? 'h-[42px] lg:h-[52px]' : 'h-[54px] lg:h-[70px]'
          }`}
        />
        <button 
          onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })}
          className="hidden lg:block text-[#F5F5F5] font-sans font-medium hover:text-[var(--color-brand-secondary)] transition-colors cursor-pointer"
        >
          CONTATO
        </button>
      </nav>

      {/* SECTION 1: HERO */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10 lg:hidden" />
          <img 
            src="https://frwfcibbvbj5zog7.public.blob.vercel-storage.com/geral/prancheta-3-1778770151776.webp"
            alt="Fábrica de tricô mobile"
            className="lg:hidden w-full h-full object-cover object-top"
          />
          <img 
            src="https://frwfcibbvbj5zog7.public.blob.vercel-storage.com/geral/prancheta-1-1778766044489.webp"
            alt="Máquina de tecelagem"
            className="hidden lg:block w-full h-full object-cover object-top"
          />
        </div>

        <div className="relative z-20 text-left px-6 lg:pl-56 lg:pr-20 max-w-6xl">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[#F5F5F5] font-sans font-semibold tracking-widest text-[9px] sm:text-xs lg:text-sm uppercase mb-4 block whitespace-nowrap"
          >
            EXCLUSIVO PARA LOJISTAS E CONFECCIONISTAS
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#F5F5F5] text-3xl lg:text-7xl font-normal mb-6 leading-tight"
          >
            A <span className="text-[var(--color-brand-secondary)]">qualidade</span> das <br /> gigantes da moda <br /> na produção da <br /> <span className="text-[var(--color-brand-secondary)]">sua marca.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[#F5F5F5] text-sm lg:text-xl font-sans mb-10 max-w-2xl leading-relaxed"
          >
            <span className="lg:hidden">
              Desenvolvemos sua coleção <br />
              do zero ou escalamos a sua <br />
              capacidade produtiva.
            </span>
            <span className="hidden lg:inline">
              Desenvolvemos sua coleção do zero ou <br /> escalamos a sua capacidade produtiva.
            </span>
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 500, damping: 30 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[var(--color-brand-secondary)] text-[#F5F5F5] px-5 lg:px-8 py-4 rounded-full font-sans font-bold text-[11px] lg:text-lg flex items-center gap-2 transition-colors hover:bg-[#b55529] whitespace-nowrap"
          >
            QUERO PRODUZIR COM A MODA CRIATIVA
            <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
          </motion.button>
        </div>

      </section>

      {/* SECTION 2: A COLEÇÃO */}
      <section className="section-padding bg-[#F5F5F5]">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Photos Grid - Left Side */}
          <div className="w-full lg:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 order-2 lg:order-1">
            {[
              "https://frwfcibbvbj5zog7.public.blob.vercel-storage.com/geral/prancheta-5-1778783191187.webp",
              "https://frwfcibbvbj5zog7.public.blob.vercel-storage.com/geral/prancheta-2-1778782398136.webp",
              "https://frwfcibbvbj5zog7.public.blob.vercel-storage.com/geral/prancheta-4-1778782397928.webp",
              "https://frwfcibbvbj5zog7.public.blob.vercel-storage.com/geral/prancheta-6-1778783191138.webp",
              "https://frwfcibbvbj5zog7.public.blob.vercel-storage.com/geral/prancheta-3-1778782397944.webp",
              "https://frwfcibbvbj5zog7.public.blob.vercel-storage.com/geral/prancheta-1-1778782397895.webp",
            ].map((img, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: false }}
                className="relative aspect-square overflow-hidden rounded-2xl shadow-sm"
              >
                <img 
                  src={img} 
                  alt={`Detalhe Tricô ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </motion.div>
            ))}
          </div>

          {/* Title - Right Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            className="w-full lg:w-1/3 text-left order-1 lg:order-2"
          >
            <h2 className="text-3xl lg:text-6xl font-semibold leading-tight font-serif">
              <span className="text-[#D46A34]">A EXCELÊNCIA</span> <br />
              <span className="text-[#D46A34]">DO NOSSO TRICÔ</span> <br />
              <span className="text-[#0A1A3A]">EM CADA PONTO</span>
            </h2>
            <div className="w-20 h-1 bg-[#D46A34] mt-6" />
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: NÚMEROS DE AUTORIDADE */}
      <section className="section-padding bg-[#0A1A3A] text-[#F5F5F5]">
        <div className="max-w-[1400px] mx-auto">
          <motion.h2 {...fadeIn} className="text-2xl lg:text-5xl text-left lg:text-center mb-16 font-serif leading-tight uppercase tracking-tight">
            POR QUE AS MAIORES MARCAS DO BRASIL <br />
            <span className="text-[#D46A34] inline-block mt-2">
              ESCOLHEM A MODA CRIATIVA?
            </span>
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { icon: Star, title: "20 Anos de Mercado", desc: "Um legado de confiança e excelência na tecelagem nacional." },
              { icon: Shirt, title: "Grandes Clientes", desc: "Produção para Farm, Animale, Open, Cantão e Dress To." },
              { icon: TrendingUp, title: "+210 Mil Peças/Ano", desc: "Alta capacidade produtiva para escalar a sua marca." },
              { icon: ShieldCheck, title: "Certificação BVTEX", desc: "Responsabilidade e padrão internacional (Bronze em andamento)." },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: false }}
                className="flex flex-row lg:flex-col items-center lg:text-center px-4 gap-5 lg:gap-0"
              >
                <div className="shrink-0 inline-flex p-3 lg:p-4 rounded-full bg-[#F5F5F5]/5 lg:mb-6 text-[#D46A34]">
                  <item.icon className="w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="text-left lg:text-center">
                  <h3 className="text-lg lg:text-xl font-bold mb-1 lg:mb-3">{item.title}</h3>
                  <p className="text-gray-400 font-sans text-xs lg:text-base leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SOBRE A MARCA E NOSSO SERVIÇO */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            className="relative"
          >
            <img 
              src="https://frwfcibbvbj5zog7.public.blob.vercel-storage.com/geral/09-1778786378162.webp" 
              alt="Estrutura da Fábrica" 
              className="rounded-2xl shadow-2xl relative z-10"
            />
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#0A1A3A] rounded-2xl -z-10 hidden md:block" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
          >
            <h2 className="text-2xl lg:text-5xl mb-8 font-serif font-bold leading-tight text-[#D46A34]">
              A SUA COLEÇÃO, <br />
              NOSSA EXPERTISE.
            </h2>
            <p className="lg:hidden text-gray-600 font-sans text-base mb-8 leading-relaxed">
              A Moda Criativa nasceu há mais de 20 <br />
              anos como um polo de excelência <br />
              têxtil. Nós entendemos que gerenciar <br />
              a produção é o maior gargalo para <br />
              quem quer crescer. Por isso, <br />
              oferecemos o serviço completo de <br />
              Private Label: nós desenvolvemos <br />
              a peça do absoluto zero, tecemos, <br />
              costuramos e entregamos a coleção <br />
              pronta para você vender.
            </p>
            <p className="hidden lg:block text-gray-600 font-sans text-lg mb-8 leading-relaxed">
              A Moda Criativa nasceu há mais de 20 anos como um polo de <br />
              excelência têxtil. Nós entendemos que gerenciar a produção é <br />
              o maior gargalo para quem quer crescer. Por isso, oferecemos <br />
              o serviço completo de Private Label: nós desenvolvemos a peça <br />
              do absoluto zero, tecemos, costuramos e entregamos a coleção <br />
              pronta para você vender.
            </p>
            
            <div className="space-y-6 mb-10">
              {[
                { icon: Star, label: "Grade Completa:", text: " Do infantil ao Plus Size (GG, 3G, 4G)." },
                { icon: Tag, label: "Pedido Mínimo:", text: " A partir de 300 peças." },
                { icon: Truck, label: "Condições Facilitadas:", text: " Frete flexível para grandes volumes." }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 font-sans font-medium text-gray-800">
                  <item.icon className="w-5 h-5 text-[#D46A34] stroke-[1.5]" />
                  <span className="text-xs lg:text-base leading-snug">
                    <strong className="font-bold">{item.label}</strong>{item.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: FORMULÁRIO DE QUALIFICAÇÃO */}
      <section 
        id="contato" 
        className="relative overflow-hidden min-h-screen"
      >
        {/* Background Image for the whole section */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("https://frwfcibbvbj5zog7.public.blob.vercel-storage.com/geral/chatgpt-image-14-de-mai-1778787744160.webp")'
          }}
        />

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 min-h-screen items-center py-24 px-6 lg:px-0">
          {/* TEXT CONTENT: Left/Top */}
          <div className="text-left px-4 lg:pl-56">
            <motion.h2 
              {...fadeIn}
              className="text-[#F5F5F5] text-4xl lg:text-8xl font-serif font-bold leading-tight mb-6 lg:mb-8 drop-shadow-lg"
            >
              DÊ O <br className="lg:block" /> PRÓXIMO <br className="hidden lg:block" /> PASSO.
            </motion.h2>
            
            <div className="w-16 lg:w-20 h-[1px] bg-[#F5F5F5] mx-0 mb-6 lg:mb-8 shadow-sm opacity-50" />
            
            <p className="text-[#F5F5F5] font-sans text-sm lg:text-lg uppercase tracking-widest leading-relaxed opacity-90 drop-shadow-md">
              Solicite um orçamento para a sua loja. <br className="hidden lg:block" /> Nosso time entrará em contato em breve.
            </p>
          </div>

          {/* Form Card: Right/Bottom */}
          <div className="flex justify-center lg:justify-end lg:pr-20 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              className="w-full max-w-3xl bg-[#F5F5F5] rounded-[40px] p-8 lg:p-16 shadow-2xl border border-black/5"
            >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Nome do Proprietário</label>
                <input required name="ownerName" value={formData.ownerName} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Nome da Loja/Marca</label>
                <input required name="storeName" value={formData.storeName} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">E-mail Corporativo</label>
                <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">WhatsApp da Loja</label>
                <input 
                  required 
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleDigitsOnlyChange}
                  type="tel" 
                  placeholder="(00) 00000-0000" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">CNPJ</label>
                <input 
                  required 
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleDigitsOnlyChange}
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Cidade / Estado</label>
                <input required name="cityState" value={formData.cityState} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">@ do Instagram</label>
                <input name="instagram" value={formData.instagram} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Principais marcas que vende hoje</label>
                <input name="brandsSold" value={formData.brandsSold} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Qual o seu tipo de loja?</label>
                <select required name="storeType" value={formData.storeType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all appearance-none">
                  <option value="">Selecione...</option>
                  <option>Boutique</option>
                  <option>Multimarcas</option>
                  <option>Revendedor Autônomo</option>
                  <option>Loja de Shopping</option>
                  <option>Loja Online</option>
                  <option>Magazine</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Qual o tipo de venda?</label>
                <select required name="saleType" value={formData.saleType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all appearance-none">
                  <option value="">Selecione...</option>
                  <option>Atacado</option>
                  <option>Varejo</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Tempo de CNPJ</label>
                <select required name="cnpjAge" value={formData.cnpjAge} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all appearance-none">
                  <option value="">Selecione...</option>
                  <option>Menos de 1 ano</option>
                  <option>De 1 a 2 anos</option>
                  <option>De 2 a 5 anos</option>
                  <option>Mais de 5 anos</option>
                </select>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isSubmitting}
                className="md:col-span-2 mt-6 bg-[#D46A34] text-[#F5F5F5] py-4 lg:py-5 rounded-full font-sans font-bold text-sm uppercase tracking-[0.2em] transition-all hover:bg-[#b55529] shadow-lg shadow-[#D46A34]/20"
              >
                {isSubmitting ? 'ENVIANDO...' : 'ENVIAR SOLICITAÇÃO'}
              </motion.button>
              {submitMessage && (
                <p className="md:col-span-2 text-center font-sans text-sm text-gray-600">
                  {submitMessage}
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
      </section>

      {/* SECTION 6: FOOTER */}
      <footer className="bg-[#0A1A3A] border-t border-[#F5F5F5]/10 py-8 lg:py-12">
        {/* Logo and Instagram container with absolute alignment */}
        <div className="w-full flex items-center justify-between px-6 lg:pl-56 mb-8 lg:mb-12 relative">
          <img 
            src="https://frwfcibbvbj5zog7.public.blob.vercel-storage.com/geral/logo-branca-1779825694567.webp" 
            alt="Moda Criativa Logo" 
            className="h-[70px] lg:h-[110px] object-contain"
          />
          
          <div className="lg:absolute lg:left-[50%] lg:-translate-x-[50%] lg:top-[50%] lg:-translate-y-1/2 w-full lg:max-w-[1440px] flex justify-end px-6 lg:pr-20 pointer-events-none">
            <a 
              href="https://www.instagram.com/modacriativa1216/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#F5F5F5] hover:text-[#D46A34] transition-colors pointer-events-auto"
            >
              <Instagram className="w-7 h-7 lg:w-10 lg:h-10" />
            </a>
          </div>
        </div>
        
        {/* Centered copyright text at the bottom */}
        <div className="text-center border-t border-[#F5F5F5]/10 pt-6 px-6">
          <p className="text-gray-500 font-sans text-[10px] lg:text-sm">
            Moda Criativa - Todos os direitos reservados © 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}
