import React, { useState } from "react";
import { Member } from "../types";
import { 
  User, Mail, Phone, MapPin, Briefcase, Award, ShieldAlert, 
  Lock, Key, CheckCircle2, History, AlertCircle, Smartphone, Globe, BookOpen
} from "lucide-react";

interface MemberProfileProps {
  member: Member;
  onUpdateProfile: (updatedData: Partial<Member>) => void;
}

export default function MemberProfile({ member, onUpdateProfile }: MemberProfileProps) {
  // Local state for profile inputs
  const [fullName, setFullName] = useState(member.fullName);
  const [mobile, setMobile] = useState(member.mobile);
  const [email, setEmail] = useState(member.email);
  const [dob, setDob] = useState(member.dob);
  const [gender, setGender] = useState(member.gender);
  const [maritalStatus, setMaritalStatus] = useState(member.maritalStatus);
  const [emergencyName, setEmergencyName] = useState(member.emergencyContact.name);
  const [emergencyPhone, setEmergencyPhone] = useState(member.emergencyContact.phone);
  const [occupation, setOccupation] = useState(member.occupation);
  const [employer, setEmployer] = useState(member.employer);
  const [education, setEducation] = useState(member.education);
  const [photo, setPhoto] = useState(member.photo);

  const [notifSuccess, setNotifSuccess] = useState(false);

  // Security setting states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      fullName,
      mobile,
      email,
      dob,
      gender,
      maritalStatus,
      emergencyContact: { name: emergencyName, phone: emergencyPhone },
      occupation,
      employer,
      education,
      photo
    });
    setNotifSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setNotifSuccess(false), 4000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError("As novas palavras-passe não coincidem.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    setPwSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPwSuccess(false), 4000);
  };

  // Mock Active Sessions
  const activeSessions = [
    { device: "Chrome v112 (macOS)", ip: "105.4.120.89", location: "Johannesburg, ZA", active: true },
    { device: "Android App v3.2", ip: "196.224.15.90", location: "Pretoria, ZA", active: false }
  ];

  return (
    <div className="space-y-8" id="profile-management-panel">
      {/* Visual Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-[#D3122A]" />
            Configuração do Perfil & Segurança
          </h2>
          <p className="text-xs text-slate-500 mt-1">Gerencie suas credenciais oficiais de membro, contatos de emergência e parametrizações de segurança da conta.</p>
        </div>
        <div className="text-xs font-mono font-bold bg-[#D3122A]/10 text-[#D3122A] px-3 py-1.5 rounded-xl border border-[#D3122A]/20">
          Ref: {member.membershipNo}
        </div>
      </div>

      {notifSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 shadow-xs animate-fade-in">
          <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold">Perfil Atualizado com Sucesso!</p>
            <p className="text-[11px] text-emerald-700/80">Os seus dados de auto-serviço foram sincronizados com a base de dados central do MPLA.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Form Editor */}
        <form onSubmit={handleProfileSave} className="xl:col-span-8 space-y-6">
          {/* Section 1: Personal Coordinates */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-red-50 text-[#D3122A] rounded-xl">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">Informação Pessoal</h3>
                <p className="text-[11px] text-slate-400">Dados fundamentais do seu cartão oficial de membro.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Nome Completo</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Número de Bilhete de Identidade (BI)</label>
                <input 
                  type="text" 
                  value={member.nationalId} 
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 outline-none cursor-not-allowed font-mono font-medium"
                  disabled
                />
                <span className="text-[9px] text-slate-400 block mt-1.5">O ID Nacional apenas pode ser alterado por administradores de registo.</span>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Data de Nascimento</label>
                <input 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Género</label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition font-semibold text-slate-700"
                  >
                    <option value="Male">Masculino</option>
                    <option value="Female">Feminino</option>
                    <option value="Other">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Estado Civil</label>
                  <select 
                    value={maritalStatus} 
                    onChange={(e) => setMaritalStatus(e.target.value as any)}
                    className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition font-semibold text-slate-700"
                  >
                    <option value="Single">Solteiro(a)</option>
                    <option value="Married">Casado(a)</option>
                    <option value="Divorced">Divorciado(a)</option>
                    <option value="Widowed">Viúvo(a)</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Foto de Perfil (URL da Imagem)</label>
                <input 
                  type="text" 
                  value={photo} 
                  onChange={(e) => setPhoto(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition font-mono"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Emergencies */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">Contactos & Emergências</h3>
                <p className="text-[11px] text-slate-400">Como a equipa do comité o poderá contactar rapidamente.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Telemóvel</label>
                <input 
                  type="text" 
                  value={mobile} 
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Endereço de E-mail</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition font-semibold"
                  required
                />
              </div>

              <div className="border-t border-slate-100 pt-4 sm:col-span-2">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Contacto de Emergência Directo
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">Nome do Contacto</label>
                    <input 
                      type="text" 
                      value={emergencyName} 
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition"
                      placeholder="Nome do parente / contacto"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">Telemóvel do Contacto</label>
                    <input 
                      type="text" 
                      value={emergencyPhone} 
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition font-semibold"
                      placeholder="+27..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Professional & Work */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Briefcase className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm">Informação Profissional</h3>
                <p className="text-[11px] text-slate-400">Dados para estatísticas de formação académica de quadros.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Profissão / Ocupação</label>
                <input 
                  type="text" 
                  value={occupation} 
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Entidade Patronal / Empresa</label>
                <input 
                  type="text" 
                  value={employer} 
                  onChange={(e) => setEmployer(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1.5">Nível Académico</label>
                <input 
                  type="text" 
                  value={education} 
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] focus:bg-white outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#D3122A] hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-xs transition shadow-md shadow-red-200/50 cursor-pointer"
            >
              Gravar Alterações do Perfil
            </button>
          </div>
        </form>

        {/* Right Column: Account Security & Multi-Factor Settings */}
        <div className="xl:col-span-4 space-y-6">
          {/* Party Metadata Info */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFCC00]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-[#FFCC00]" />
              <h3 className="font-display font-extrabold text-sm tracking-tight text-white">Posicionamento no Partido</h3>
            </div>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-white/10 pb-2.5">
                <span className="text-slate-400">Cartão de Membro</span>
                <span className="font-mono font-bold text-[#FFCC00]">{member.membershipNo}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2.5">
                <span className="text-slate-400">Comité Local</span>
                <span className="font-semibold text-slate-200 text-right">{member.committee}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2.5">
                <span className="text-slate-400">Província / Categoria</span>
                <span className="font-semibold text-slate-200">{member.province} ({member.category})</span>
              </div>
              <div className="flex justify-between pb-1 items-start">
                <span className="text-slate-400">Funções de Liderança</span>
                <div className="text-right flex flex-col items-end gap-1">
                  {member.leadershipRoles && member.leadershipRoles.length > 0 ? (
                    member.leadershipRoles.map((role, idx) => (
                      <span key={idx} className="inline-block font-mono font-extrabold text-[9px] bg-[#D3122A]/30 border border-[#D3122A]/50 px-2 py-0.5 rounded text-red-200">{role}</span>
                    ))
                  ) : (
                    <span className="italic text-[10px] text-slate-500">Membro Geral</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Lock className="w-4.5 h-4.5 text-[#D3122A]" />
              <h3 className="font-display font-bold text-slate-800 text-sm">Alterar Palavra-Passe</h3>
            </div>

            {pwSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-800 text-[11px] font-semibold">
                Palavra-passe atualizada com sucesso.
              </div>
            )}
            {pwError && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-800 text-[11px] font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">Palavra-Passe Actual</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">Nova Palavra-Passe</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">Confirmar Nova Palavra-Passe</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#D3122A]/20 focus:border-[#D3122A] outline-none transition"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Mudar Palavra-Passe
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication & Biometrics */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Smartphone className="w-4.5 h-4.5 text-[#D3122A]" />
              <h3 className="font-display font-bold text-slate-800 text-sm">Dois Factores (2FA) & Biometria</h3>
            </div>

            <div className="space-y-4">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">Autenticação de 2 Factores (2FA)</p>
                  <p className="text-[10px] text-slate-400">Solicitar código OTP enviado por SMS ou E-mail a cada login.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    twoFactorEnabled ? 'bg-[#D3122A]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      twoFactorEnabled ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Biometric Toggle */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">Desbloqueio Biométrico</p>
                  <p className="text-[10px] text-slate-400">Permitir acesso rápido à carteira digital através de Face ID ou Touch ID.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBiometricEnabled(!biometricEnabled)}
                  className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    biometricEnabled ? 'bg-[#D3122A]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      biometricEnabled ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <History className="w-4.5 h-4.5 text-[#D3122A]" />
              <h3 className="font-display font-bold text-slate-800 text-sm">Sessões Activas</h3>
            </div>

            <div className="space-y-3.5">
              {activeSessions.map((session, i) => (
                <div key={i} className="flex justify-between items-start text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-slate-700">{session.device}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">IP: {session.ip} • {session.location}</p>
                  </div>
                  {session.active ? (
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-100">Activo</span>
                  ) : (
                    <span className="text-[9px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full border border-slate-200">Sessão</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
