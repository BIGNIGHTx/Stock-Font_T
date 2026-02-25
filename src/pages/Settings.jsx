import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Text } from '../components/text';

const Settings = ({ darkMode, setDarkMode }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
            <div className="p-8 max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 stagger-item delay-1">
                    <div>
                        <Text as="h2" className="text-3xl font-display font-medium text-slate-900 dark:text-dark-text">Settings</Text>
                        <Text className="text-slate-500 dark:text-dark-muted mt-1">Manage your application preferences.</Text>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm p-6 stagger-item delay-2 transition-colors">
                    <Text as="h3" className="text-xl font-bold text-slate-800 dark:text-dark-text mb-6">Appearance</Text>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl transition-colors ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-100 text-slate-600'}`}>
                                {darkMode ? <Moon size={24} /> : <Sun size={24} />}
                            </div>
                            <div>
                                <Text className="font-semibold text-slate-800 dark:text-dark-text transition-colors">Dark Mode Theme</Text>
                                <Text className="text-sm text-slate-500 dark:text-dark-muted transition-colors">
                                    {darkMode ? 'Currently using dark appearance' : 'Currently using light appearance'}
                                </Text>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={darkMode}
                                onChange={() => setDarkMode(!darkMode)}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 dark:peer-focus:ring-blue-800/30 rounded-full peer dark:bg-dark-surface peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-dark-border peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
