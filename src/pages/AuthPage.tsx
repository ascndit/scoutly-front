import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, UserCheck, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Input } from '../shared/ui/Input';
import { Button } from '../shared/ui/Button';
import { api } from '../shared/api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/store/useAuthStore';

type AuthMode = 'login' | 'register';
type RoleOption = 'Applicant' | 'Employer';

export function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('login');
    const [role, setRole] = useState<RoleOption>('Applicant');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string; server?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const completeAuth = (userEmail: string, userRole: 'Applicant' | 'Employer', token?: string) => {
        loginUser(userEmail, userRole, token);
        navigate(userRole === 'Employer' ? '/employer/dashboard' : '/vacancies');
    };

    const validate = () => {
        const nextErrors: typeof errors = {};
        if (!email.includes('@')) {
            nextErrors.email = 'Введите корректный адрес электронной почты';
        }
        if (password.length < 6) {
            nextErrors.password = 'Пароль должен содержать минимум 6 символов';
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setErrors({});
        try {
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
            const payload = mode === 'login' ? { email, password } : { email, password, role };
            const { data } = await api.post(endpoint, payload);

            if (data?.accessToken) {
                completeAuth(email, data.user?.role || role, data.accessToken);
            }
        } catch {
            setErrors({
                server:
                    mode === 'login'
                        ? 'Неверный логин или пароль (либо сервер API еще не запущен)'
                        : 'Не удалось завершить регистрацию. Проверьте данные.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-scoutly-bg">
            {/* Левая брендированная панель Scoutly */}
            <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="hidden lg:flex flex-col justify-between bg-scoutly-primary p-12 text-white relative overflow-hidden"
            >
                {/* Декоративные фоновые градиентные сферы */}
                <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-scoutly-accent/20 blur-3xl" />
                <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-scoutly-action/25 blur-3xl" />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                        <Sparkles className="h-5 w-5 text-scoutly-accent" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Scoutly</span>
                </div>

                <div className="relative z-10 max-w-md space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                        className="text-4xl font-bold leading-tight"
                    >
                        Интеллектуальный поиск и скаутинг IT-специалистов
                    </motion.h1>
                    <p className="text-white/80 text-base leading-relaxed">
                        Единая платформа для соискателей, работодателей и рекрутеров: точный скоринг компетенций,
                        прозрачная воронка найма и мгновенные отклики.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm border border-white/10">
                            <div className="text-2xl font-bold text-white">98%</div>
                            <div className="text-xs text-white/75 mt-1">Точность матчинга по стеку</div>
                        </div>
                        <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm border border-white/10">
                            <div className="text-2xl font-bold text-white">&lt; 2 сек</div>
                            <div className="text-xs text-white/75 mt-1">Отклик поискового ядра</div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-xs text-white/60">
                    <ShieldCheck className="h-4 w-4 text-scoutly-accent" />
                    <span>Платформа Scoutly • Веб-портал соискателя и работодателя</span>
                </div>
            </motion.div>

            {/* Правая панель: форма SCR-01 */}
            <div className="flex items-center justify-center p-6 sm:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="w-full max-w-md rounded-lg bg-white p-8 shadow-md border border-gray-100"
                >
                    {/* Переключатель Вход / Регистрация */}
                    <div className="relative grid grid-cols-2 rounded-lg bg-scoutly-bg p-1 mb-6">
                        {(['login', 'register'] as const).map((tab) => {
                            const isActive = mode === tab;
                            return (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => {
                                        setMode(tab);
                                        setErrors({});
                                    }}
                                    className={`relative z-10 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                                        isActive ? 'text-scoutly-primary' : 'text-scoutly-muted hover:text-scoutly-dark'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="auth-tab-indicator"
                                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                                            className="absolute inset-0 rounded-md bg-white shadow-xs"
                                        />
                                    )}
                                    <span className="relative z-10">{tab === 'login' ? 'Вход' : 'Регистрация'}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-scoutly-dark">
                            {mode === 'login' ? 'Добро пожаловать' : 'Создание аккаунта'}
                        </h2>
                        <p className="text-sm text-scoutly-muted mt-1">
                            {mode === 'login'
                                ? 'Введите учетные данные для перехода в личный кабинет'
                                : 'Выберите роль и заполните данные для старта работы'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Переключатель ролей (только при регистрации, согласно US-01) */}
                        <AnimatePresence initial={false}>
                            {mode === 'register' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.22 }}
                                    className="overflow-hidden"
                                >
                                    <label className="block text-xs font-medium text-scoutly-muted mb-2">
                                        Выберите вашу роль в системе
                                    </label>
                                    <div className="grid grid-cols-2 gap-3 pb-1">
                                        {[
                                            { id: 'Applicant', title: 'Соискатель', icon: UserCheck },
                                            { id: 'Employer', title: 'Работодатель', icon: Briefcase },
                                        ].map((item) => {
                                            const Icon = item.icon;
                                            const selected = role === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setRole(item.id as RoleOption)}
                                                    className={`flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm font-medium transition-all cursor-pointer ${
                                                        selected
                                                            ? 'border-scoutly-accent bg-scoutly-accent/10 text-scoutly-primary'
                                                            : 'border-gray-200 text-scoutly-muted hover:border-gray-300'
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" />
                                                    <span>{item.title}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Input
                            label="Электронная почта"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                        />

                        <Input
                            label="Пароль"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                        />

                        <AnimatePresence>
                            {errors.server && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className="rounded-lg bg-status-danger/10 border border-status-danger/30 p-3 text-xs text-status-danger"
                                >
                                    {errors.server}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            variant={mode === 'login' ? 'primary' : 'action'}
                            isLoading={isLoading}
                            className="w-full mt-2"
                        >
                            <span>{mode === 'login' ? 'Войти в кабинет' : 'Зарегистрироваться'}</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-[11px] text-center text-scoutly-muted mb-2.5">
                                Быстрый предпросмотр интерфейсов (без запуска API):
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => completeAuth('applicant@scoutly.ru', 'Applicant')}
                                    className="rounded-lg border border-gray-200 py-2 text-xs font-medium text-scoutly-primary hover:bg-scoutly-primary/5 transition-colors cursor-pointer"
                                >
                                    Войти как Соискатель
                                </button>
                                <button
                                    type="button"
                                    onClick={() => completeAuth('hr@yandex-team.ru', 'Employer')}
                                    className="rounded-lg border border-gray-200 py-2 text-xs font-medium text-scoutly-action hover:bg-scoutly-action/5 transition-colors cursor-pointer"
                                >
                                    Войти как Работодатель
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}