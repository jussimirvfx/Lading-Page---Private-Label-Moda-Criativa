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
import WhatsAppFloatingButtonScroll from './components/WhatsAppFloatingButtonScroll';

type LeadFormData = {
  nome: string;
  storeName: string;
  email: string;
  telefone: string;
  cnpj: string;
  cidade: string;
  estado: string;
  instagram: string;
  brandsSold: string;
  storeType: string;
  saleType: string;
  cnpjAge: string;
  productionPieces: string;
};

type LeadFormField = keyof LeadFormData;

type LeadFormAnswer = {
  field: LeadFormField;
  question: string;
  answer: string;
  value: string;
};

type LeadScoreBreakdownItem = {
  question: string;
  answer: string;
  points: number;
  disqualifies: boolean;
  reason?: string;
};

type LeadScoreDetails = {
  value: number;
  lead_score: number;
  raw_score: number;
  qualified: boolean;
  is_disqualified: boolean;
  disqualification_reasons: string[];
  breakdown: LeadScoreBreakdownItem[];
};

const initialFormData: LeadFormData = {
  nome: '',
  storeName: '',
  email: '',
  telefone: '',
  cnpj: '',
  cidade: '',
  estado: '',
  instagram: '',
  brandsSold: '',
  storeType: '',
  saleType: '',
  cnpjAge: '',
  productionPieces: ''
};

const formFieldLabels: Record<LeadFormField, string> = {
  nome: 'Nome completo',
  storeName: 'Nome da Loja/Marca',
  email: 'E-mail Corporativo',
  telefone: 'WhatsApp da Loja',
  cnpj: 'CNPJ',
  cidade: 'Cidade',
  estado: 'Estado',
  instagram: '@ do Instagram',
  brandsSold: 'Principais marcas que vende hoje',
  storeType: 'Qual o seu tipo de loja?',
  saleType: 'Qual o tipo de venda?',
  cnpjAge: 'Tempo de CNPJ',
  productionPieces: 'Peças para o portfólio'
};

const formFieldOrder = Object.keys(formFieldLabels) as LeadFormField[];

const DDDS_VALIDOS = [
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46,
  47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99
];

const ESTADOS_BRASIL = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

const leadScoreConfig = {
  stateConfig: {
    priorityStates: [
      'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'GO', 'DF', 'BA', 'PE', 'CE', 'ES', 'MT',
      'MS', 'PB', 'RN', 'AL', 'SE', 'PI', 'MA', 'TO', 'PA', 'AM', 'RO', 'AC', 'RR', 'AP'
    ],
    pointsForPriorityState: 1
  },
  questions: {
    storeType: [
      { value: 'boutique', label: 'Boutique', points: 25, disqualifies: false },
      { value: 'shopping', label: 'Loja de shopping', points: 20, disqualifies: false },
      { value: 'tradicional', label: 'Loja de bairro / tradicional', points: 10, disqualifies: false },
      { value: 'online', label: 'Loja online', points: 10, disqualifies: false },
      { value: 'multimarcas', label: 'Multimarcas', points: 20, disqualifies: false },
      { value: 'autonomo', label: 'Revendedor(a) autônomo(a)', points: 0, disqualifies: true },
      { value: 'magazine', label: 'Magazine', points: 0, disqualifies: true }
    ],
    saleType: [
      { value: 'atacado', label: 'Atacado', points: 14, disqualifies: false },
      { value: 'varejo', label: 'Varejo', points: 7, disqualifies: false }
    ],
    cnpjAge: [
      { value: 'menos-de-1-ano', label: 'Menos de 1 ano', points: 5, disqualifies: false },
      { value: '1-a-2-anos', label: 'De 1 a 2 anos', points: 10, disqualifies: false },
      { value: '3-a-4-anos', label: 'De 3 a 4 anos', points: 15, disqualifies: false },
      { value: 'mais-de-5-anos', label: 'Mais de 5 anos', points: 20, disqualifies: false }
    ],
    productionPieces: [
      { value: '4000-pecas', label: '4.000 peças', points: 40, disqualifies: false },
      { value: '2000-pecas', label: '2.000 peças', points: 30, disqualifies: false },
      { value: '1000-pecas', label: '1.000 peças', points: 20, disqualifies: false },
      { value: '500-pecas', label: '500 peças', points: 10, disqualifies: false },
      { value: '300-pecas', label: '300 peças', points: 5, disqualifies: false }
    ]
  }
};

type LeadScoreQuestion = keyof typeof leadScoreConfig.questions;

const questionLabels: Record<LeadScoreQuestion, string> = {
  storeType: 'Qual o tipo da loja?',
  saleType: 'Qual o seu tipo de venda?',
  cnpjAge: 'Qual o tempo de CNPJ da sua empresa?',
  productionPieces: 'Quantas peças você pensa em produzir para o seu portfólio?'
};

const telefoneMask = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);

  if (numbers.length <= 2) {
    return numbers ? `(${numbers}` : '';
  }

  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const cnpjMask = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 14);

  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  }

  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
};

const validarTelefone = (telefone: string): boolean => {
  const numeros = telefone.replace(/\D/g, '');
  return numeros.length >= 10 && numeros.length <= 11;
};

const validarTelefoneCompleto = (telefone: string): { valido: boolean; erro?: string } => {
  const numeros = telefone.replace(/\D/g, '');

  if (!validarTelefone(telefone)) {
    return { valido: false, erro: 'Telefone deve ter 10 ou 11 dígitos' };
  }

  const ddd = Number(numeros.slice(0, 2));
  if (!DDDS_VALIDOS.includes(ddd)) {
    return { valido: false, erro: 'DDD inválido' };
  }

  if (numeros.length === 11 && numeros[2] !== '9') {
    return { valido: false, erro: 'Celular deve ter o 9 após o DDD' };
  }

  return { valido: true };
};

const validarCnpj = (cnpj: string): { valido: boolean; erro?: string } => {
  const numeros = cnpj.replace(/\D/g, '');

  if (numeros.length !== 14) {
    return { valido: false, erro: 'CNPJ deve ter 14 dígitos' };
  }

  return { valido: true };
};

const converterParaE164 = (telefone: string): string => {
  const numeros = telefone.replace(/\D/g, '');
  return numeros.startsWith('55') && numeros.length > 11 ? `+${numeros}` : `+55${numeros}`;
};

const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const getSelectedOption = (question: LeadScoreQuestion, value: string) => {
  return leadScoreConfig.questions[question].find((option) => option.value === value);
};

const getSelectedLabel = (question: LeadScoreQuestion, value: string) => {
  return getSelectedOption(question, value)?.label ?? value;
};

const getEstadoLabel = (value: string) => {
  return ESTADOS_BRASIL.find((estado) => estado.value === value)?.label ?? value;
};

const getFormAnswerLabel = (field: LeadFormField, data: LeadFormData) => {
  if (field === 'estado') return getEstadoLabel(data.estado);
  if (field === 'storeType') return getSelectedLabel('storeType', data.storeType);
  if (field === 'saleType') return getSelectedLabel('saleType', data.saleType);
  if (field === 'cnpjAge') return getSelectedLabel('cnpjAge', data.cnpjAge);
  if (field === 'productionPieces') return getSelectedLabel('productionPieces', data.productionPieces);

  return data[field].trim();
};

const buildFormAnswers = (data: LeadFormData): LeadFormAnswer[] => {
  return formFieldOrder.map((field) => ({
    field,
    question: formFieldLabels[field],
    answer: getFormAnswerLabel(field, data),
    value: data[field].trim()
  }));
};

const calculateLeadScoreDetails = (data: LeadFormData): LeadScoreDetails => {
  let rawScore = 0;
  const breakdown: LeadScoreBreakdownItem[] = [];
  const disqualificationReasons: string[] = [];
  const statePoints = leadScoreConfig.stateConfig.priorityStates.includes(data.estado)
    ? leadScoreConfig.stateConfig.pointsForPriorityState
    : 0;

  rawScore += statePoints;
  breakdown.push({
    question: 'Em qual estado está localizado?',
    answer: getEstadoLabel(data.estado),
    points: statePoints,
    disqualifies: false
  });

  (Object.keys(leadScoreConfig.questions) as LeadScoreQuestion[]).forEach((question) => {
    const selectedOption = getSelectedOption(question, data[question]);
    if (!selectedOption) return;

    const item: LeadScoreBreakdownItem = {
      question: questionLabels[question],
      answer: selectedOption.label,
      points: selectedOption.points,
      disqualifies: selectedOption.disqualifies
    };

    if (selectedOption.disqualifies) {
      item.reason = `${questionLabels[question]}: ${selectedOption.label}`;
      disqualificationReasons.push(item.reason);
    } else {
      rawScore += selectedOption.points;
    }

    breakdown.push(item);
  });

  const isDisqualified = disqualificationReasons.length > 0;
  const cappedRawScore = Math.min(rawScore, 100);
  const finalScore = isDisqualified ? 0 : cappedRawScore;

  return {
    value: finalScore,
    lead_score: finalScore,
    raw_score: cappedRawScore,
    qualified: !isDisqualified,
    is_disqualified: isDisqualified,
    disqualification_reasons: disqualificationReasons,
    breakdown
  };
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
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    const nextValue =
      name === 'telefone'
        ? telefoneMask(value)
        : name === 'cnpj'
          ? cnpjMask(value)
        : name === 'estado'
          ? value.toUpperCase()
          : value;

    setFormData((currentData) => ({
      ...currentData,
      [name]: nextValue
    }));
  };

  const buildLeadData = (leadScoreDetails: LeadScoreDetails) => {
    const formAnswers = buildFormAnswers(formData);
    const formAnswersByField = formAnswers.reduce(
      (answers, answer) => ({
        ...answers,
        [answer.field]: answer
      }),
      {} as Record<LeadFormField, LeadFormAnswer>
    );

    return {
      name: formData.nome.trim(),
      email: formData.email.trim(),
      phone: converterParaE164(formData.telefone),
      city: formData.cidade.trim(),
      state: formData.estado,
      state_name: getEstadoLabel(formData.estado),
      country: 'Brasil',
      store_name: formData.storeName.trim(),
      cnpj: formData.cnpj,
      instagram: formData.instagram.trim(),
      brands_sold: formData.brandsSold.trim(),
      store_type: getSelectedLabel('storeType', formData.storeType),
      sale_type: getSelectedLabel('saleType', formData.saleType),
      cnpj_age: getSelectedLabel('cnpjAge', formData.cnpjAge),
      production_pieces: getSelectedLabel('productionPieces', formData.productionPieces),
      form_answers: formAnswers,
      form_answers_by_field: formAnswersByField,
      qualified: leadScoreDetails.qualified,
      is_disqualified: leadScoreDetails.is_disqualified,
      disqualification_reason: leadScoreDetails.disqualification_reasons.join('; ') || null,
      disqualification_reasons: leadScoreDetails.disqualification_reasons,
      value: leadScoreDetails.value,
      currency: 'BRL',
      content_name: 'Formulário de Contato',
      content_category: 'Lead Generation',
      lead_score: leadScoreDetails.lead_score,
      lead_score_details: leadScoreDetails
    };
  };

  const enviarParaWebhook = async (leadData: ReturnType<typeof buildLeadData>) => {
    const webhookUrl = import.meta.env.VITE_FORM_WEBHOOK_URL || '/api/lead';
    const webhookToken = import.meta.env.VITE_WEBHOOK_TOKEN || '';
    const webhookPayload = {
      ...leadData,
      timestamp: new Date().toISOString(),
      source: 'landing-page',
      user_agent: navigator.userAgent,
      page_url: window.location.href,
      referrer: document.referrer || 'direct'
    };

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (webhookToken) {
      headers.Authorization = `Bearer ${webhookToken}`;
    }

    console.log('Payload final enviado ao webhook:', webhookPayload);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload)
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }

    return response.json().catch(() => ({ ok: true }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const hasEmptyRequiredField = (Object.values(formData) as string[]).some((value) => !value.trim());

    if (hasEmptyRequiredField) {
      setSubmitMessage('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!validarEmail(formData.email)) {
      setSubmitMessage('Informe um e-mail válido.');
      return;
    }

    const validacaoTelefone = validarTelefoneCompleto(formData.telefone);
    if (!validacaoTelefone.valido) {
      setSubmitMessage(`Telefone inválido: ${validacaoTelefone.erro}`);
      return;
    }

    const validacaoCnpj = validarCnpj(formData.cnpj);
    if (!validacaoCnpj.valido) {
      setSubmitMessage(`CNPJ inválido: ${validacaoCnpj.erro}`);
      return;
    }

    const leadScoreDetails = calculateLeadScoreDetails(formData);
    const leadData = buildLeadData(leadScoreDetails);

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      console.group('Lead preparado para webhook');
      console.log('Pontuação final:', leadScoreDetails.lead_score);
      console.log('Lead qualificado:', leadScoreDetails.qualified ? 'Sim' : 'Não');
      console.log('Lead desqualificado:', leadScoreDetails.is_disqualified ? 'Sim' : 'Não');
      console.log('Motivos de desqualificação:', leadScoreDetails.disqualification_reasons);
      console.table(leadScoreDetails.breakdown);
      console.log('Informações preenchidas que serão enviadas:', leadData);
      console.groupEnd();
      await enviarParaWebhook(leadData);
      setFormData(initialFormData);
      setSubmitMessage('Obrigado! Em breve nossa equipe entrará em contato.');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar lead para o webhook:', error);
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
          onClick={() => document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' })}
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
            onClick={() => document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' })}
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
        id="cta-form" 
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
            {isSubmitted ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center" role="status" aria-live="polite">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#D46A34]/10 text-[#D46A34]">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="mb-4 font-serif text-3xl font-bold text-[#0A1A3A]">
                  Obrigado pelo contato.
                </h3>
                <p className="max-w-md font-sans text-base leading-relaxed text-gray-600">
                  Recebemos suas informações e nossa equipe entrará em contato em breve.
                </p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Nome completo</label>
                <input required name="nome" value={formData.nome} onChange={handleChange} type="text" autoComplete="name" placeholder="Ex.: Nome completo" className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Nome da Loja/Marca</label>
                <input required name="storeName" value={formData.storeName} onChange={handleChange} type="text" placeholder="Ex.: Nome da loja ou marca" className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">E-mail Corporativo</label>
                <input required name="email" value={formData.email} onChange={handleChange} type="email" autoComplete="email" placeholder="Ex.: email@dominio.com.br" className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">WhatsApp da Loja</label>
                <input 
                  required 
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  type="tel" 
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="(11) 99999-9999" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">CNPJ</label>
                <input 
                  required 
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  type="text" 
                  inputMode="numeric"
                  maxLength={18}
                  placeholder="Ex.: CNPJ"
                  className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Cidade</label>
                <input required name="cidade" value={formData.cidade} onChange={handleChange} type="text" autoComplete="address-level2" placeholder="Ex.: Cidade" className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Estado</label>
                <select required name="estado" value={formData.estado} onChange={handleChange} autoComplete="address-level1" className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all appearance-none">
                  <option value="">Selecione...</option>
                  {ESTADOS_BRASIL.map((estado) => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">@ do Instagram</label>
                <input required name="instagram" value={formData.instagram} onChange={handleChange} type="text" placeholder="Ex.: @instagram" className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Principais marcas que vende hoje</label>
                <input required name="brandsSold" value={formData.brandsSold} onChange={handleChange} type="text" placeholder="Ex.: Marcas que vende hoje" className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Qual o seu tipo de loja?</label>
                <select required name="storeType" value={formData.storeType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all appearance-none">
                  <option value="">Selecione...</option>
                  {leadScoreConfig.questions.storeType.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Qual o tipo de venda?</label>
                <select required name="saleType" value={formData.saleType} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all appearance-none">
                  <option value="">Selecione...</option>
                  {leadScoreConfig.questions.saleType.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Tempo de CNPJ</label>
                <select required name="cnpjAge" value={formData.cnpjAge} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all appearance-none">
                  <option value="">Selecione...</option>
                  {leadScoreConfig.questions.cnpjAge.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold font-sans text-gray-400">Peças para o portfólio</label>
                <select required name="productionPieces" value={formData.productionPieces} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-100 bg-gray-50/50 font-sans text-sm focus:ring-1 focus:ring-[#D46A34] outline-none transition-all appearance-none">
                  <option value="">Selecione...</option>
                  {leadScoreConfig.questions.productionPieces.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isSubmitting}
                className="md:col-span-2 mt-6 bg-[#D46A34] text-[#F5F5F5] py-4 lg:py-5 rounded-full font-sans font-bold text-sm uppercase tracking-[0.2em] transition-all hover:bg-[#b55529] shadow-lg shadow-[#D46A34]/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'ENVIANDO...' : 'ENVIAR SOLICITAÇÃO'}
              </motion.button>
              {submitMessage && (
                <p className="md:col-span-2 text-center font-sans text-sm text-gray-600" role="alert">
                  {submitMessage}
                </p>
              )}
            </form>
            )}
          </motion.div>
        </div>
      </div>
      </section>

      <WhatsAppFloatingButtonScroll formId="cta-form" brandName="Moda Criativa" />

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
              href="https://www.instagram.com/modacriativa1843/" 
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
