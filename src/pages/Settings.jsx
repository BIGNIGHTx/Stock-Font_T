import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Text } from '../components/text';

const Settings = ({ darkMode, setDarkMode }) => {
    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <Text as="h2" className="text-3xl font-bold text-gray-800 dark:text-dark-text">Settings</Text>
                    <Text className="text-gray-500 dark:text-dark-muted mt-1">Manage your application preferences.</Text>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm p-6">
                <Text as="h3" className="text-xl font-bold text-gray-800 dark:text-dark-text mb-6">Appearance</Text>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-gray-100 text-gray-600'}`}>
                            {darkMode ? <Moon size={24} /> : <Sun size={24} />}
                        </div>
                        <div>
                            <Text className="font-semibold text-gray-800 dark:text-dark-text">Dark Mode</Text>
                            <Text className="text-sm text-gray-500 dark:text-dark-muted">
                                {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
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
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-dark-bg peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-dark-border peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Settings;
