import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Globe, CheckCircle2 } from 'lucide-react';
import { Input } from '../shared/ui/Input';
import { Button } from '../shared/ui/Button';

export function CompanyProfilePage() {
    const [name, setName] = useState('Яндекс');
    const [industry, setIndustry] = useState('Информационные технологии, ИИ и облачные сервисы');
    const [website, setWebsite] = useState('https://yandex.ru/jobs');
    const [description, setDescription] = useState(
        'Технологическая компания, создающая интеллектуальные продукты и сервисы для миллионов пользователей.'
    );
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-scoutly-dark">Профиль компании</h1>
                    <p className="text-sm text-scoutly-muted mt-1">
                        Информация об организации, отображаемая соискателям в карточках вакансий
                    </p>
                </div>

                <AnimatePresence>
                    {saved && (
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                            className="flex items-center gap-1.5 rounded-lg bg-status-success/15 text-status-success px-3.5 py-2 text-xs font-semibold"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Сохранено</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="rounded-lg bg-white p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="h-14 w-14 rounded-lg bg-scoutly-primary text-white flex items-center justify-center text-xl font-bold">
                        <Building2 className="h-7 w-7 text-scoutly-accent" />
                    </div>
                    <div>
                        <div className="text-base font-bold text-scoutly-dark">{name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-scoutly-accent mt-0.5">
                            <Globe className="h-3.5 w-3.5" />
                            <span>{website}</span>
                        </div>
                    </div>
                </div>

                <Input label="Название организации" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Отрасль деятельности" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                <Input label="Корпоративный сайт" value={website} onChange={(e) => setWebsite(e.target.value)} />

                <div>
                    <label className="block text-xs font-medium text-scoutly-dark mb-1.5">
                        Описание компании
                    </label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-scoutly-accent focus:ring-2 focus:ring-scoutly-accent/20"
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="primary" onClick={handleSave}>
                        Сохранить данные компании
                    </Button>
                </div>
            </div>
        </div>
    );
}