/**
 * app.js — Notes (core layer, trilingual fa/en/ar).
 */
(function () {
    'use strict';

    // ---- Translations ----
    I18N.register('fa', {
        note_title: 'یادداشت‌ها',
        note_new: 'یادداشت جدید',
        note_title_ph: 'عنوان',
        note_body_ph: 'متن یادداشت...',
        note_folder_ph: 'پوشه (اختیاری)',
        note_search: 'جستجوی یادداشت‌ها...',
        note_save: 'ذخیره',
        note_cancel: 'انصراف',
        note_delete: 'حذف',
        note_empty: 'یادداشتی نیست',
        note_all: 'همه',
        note_saved: 'ذخیره شد!',
        note_back: 'بازگشت به لیست اپ‌ها',
    });

    I18N.register('en', {
        note_title: 'Notes',
        note_new: 'New note',
        note_title_ph: 'Title',
        note_body_ph: 'Write your note...',
        note_folder_ph: 'Folder (optional)',
        note_search: 'Search notes...',
        note_save: 'Save',
        note_cancel: 'Cancel',
        note_delete: 'Delete',
        note_empty: 'No notes yet',
        note_all: 'All',
        note_saved: 'Saved!',
        note_back: 'Back to apps',
    });

    I18N.register('ar', {
        note_title: 'الملاحظات',
        note_new: 'ملاحظة جديدة',
        note_title_ph: 'العنوان',
        note_body_ph: 'اكتب ملاحظتك...',
        note_folder_ph: 'المجلد (اختياري)',
        note_search: 'ابحث في الملاحظات...',
        note_save: 'حفظ',
        note_cancel: 'إلغاء',
        note_delete: 'حذف',
        note_empty: 'لا ملاحظات بعد',
        note_all: 'الكل',
        note_saved: 'تم الحفظ!',
        note_back: 'العودة إلى التطبيقات',
    });

    const NS = 'notes-app';

    const App = {
        notes: [],
        folder: '',      // '' = all
        query: '',
        editingId: null,

        elements: {},

        init() {
            TG.init({ backHref: '../../' });
            I18N.init();

            this.notes = Store.getJSON(NS, 'notes', []);

            this.elements = {
                newBtn: document.getElementById('new-btn'),
                search: document.getElementById('note-search'),
                folderChips: document.getElementById('folder-chips'),
                list: document.getElementById('note-list'),
                editor: document.getElementById('editor'),
                edFolder: document.getElementById('ed-folder'),
                edTitle: document.getElementById('ed-title'),
                edBody: document.getElementById('ed-body'),
                edSave: document.getElementById('ed-save'),
                edCancel: document.getElementById('ed-cancel'),
                edDelete: document.getElementById('ed-delete'),
            };

            this.setupEvents();
            this.render();

            document.addEventListener('i18n:changed', () => {
                document.title = I18N.t('note_title');
                this.render();
            });
            document.title = I18N.t('note_title');
        },

        setupEvents() {
            this.elements.newBtn.addEventListener('click', () => this.openEditor(null));
            this.elements.search.addEventListener('input', () => {
                this.query = this.elements.search.value.trim().toLowerCase();
                this.render();
            });
            this.elements.edSave.addEventListener('click', () => this.saveEditor());
            this.elements.edCancel.addEventListener('click', () => this.closeEditor());
            this.elements.edDelete.addEventListener('click', () => this.deleteEditing());
        },

        save() {
            Store.setJSON(NS, 'notes', this.notes);
        },

        folders() {
            const set = new Set(this.notes.map(n => n.folder).filter(Boolean));
            return [...set].sort();
        },

        openEditor(id) {
            this.editingId = id;
            const note = id ? this.notes.find(n => n.id === id) : null;
            this.elements.edFolder.value = note?.folder || '';
            this.elements.edTitle.value = note?.title || '';
            this.elements.edBody.value = note?.body || '';
            this.elements.edDelete.classList.toggle('hidden', !note);
            this.elements.editor.classList.remove('hidden');
            this.elements.edTitle.focus();
        },

        closeEditor() {
            this.editingId = null;
            this.elements.editor.classList.add('hidden');
        },

        saveEditor() {
            const title = this.elements.edTitle.value.trim();
            const body = this.elements.edBody.value.trim();
            const folder = this.elements.edFolder.value.trim();
            if (!title && !body) {
                this.closeEditor();
                return;
            }
            if (this.editingId) {
                const note = this.notes.find(n => n.id === this.editingId);
                if (note) {
                    note.title = title;
                    note.body = body;
                    note.folder = folder;
                    note.updated = Date.now();
                }
            } else {
                this.notes.unshift({
                    id: Store.id(),
                    title: title || I18N.t('note_new'),
                    body: body,
                    folder: folder,
                    created: Date.now(),
                    updated: Date.now(),
                });
            }
            this.save();
            this.closeEditor();
            this.render();
            TG.toast(I18N.t('note_saved'), 'success');
            TG.haptic('medium');
        },

        deleteEditing() {
            if (!this.editingId) return;
            this.notes = this.notes.filter(n => n.id !== this.editingId);
            this.save();
            this.closeEditor();
            this.render();
            TG.haptic('medium');
        },

        render() {
            // Folder chips (All + distinct folders with counts)
            const folders = this.folders();
            const countFor = f => this.notes.filter(n => (n.folder || '') === f).length;
            const totalCount = this.notes.length;
            const chips = [
                `<button class="folder-chip${this.folder === '' ? ' active' : ''}" data-folder="">${I18N.t('note_all')} (${totalCount})</button>`,
                ...folders.map(f =>
                    `<button class="folder-chip${this.folder === f ? ' active' : ''}" data-folder="${this.escapeAttr(f)}">📁 ${this.escape(f)} (${countFor(f)})</button>`
                ),
            ];
            this.elements.folderChips.innerHTML = chips.join('');
            this.elements.folderChips.querySelectorAll('.folder-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    this.folder = chip.dataset.folder;
                    this.render();
                    TG.haptic('light');
                });
            });

            // Notes
            const filtered = this.notes
                .filter(n => this.folder === '' || n.folder === this.folder)
                .filter(n => {
                    if (!this.query) return true;
                    return (n.title + ' ' + n.body + ' ' + n.folder).toLowerCase().includes(this.query);
                })
                .sort((a, b) => b.updated - a.updated);

            if (filtered.length === 0) {
                this.elements.list.innerHTML = `<div class="empty-note">${I18N.t('note_empty')}</div>`;
                return;
            }
            this.elements.list.innerHTML = filtered.map(n => `
                <button class="note-card" data-id="${n.id}">
                    <h4>${n.title ? this.escape(n.title) : ''}</h4>
                    <div class="snippet">${n.body ? this.escape(n.body).replace(/\n/g, ' ') : ''}</div>
                    <div class="note-meta">
                        ${n.folder ? `<span>📁 ${this.escape(n.folder)}</span>` : ''}
                        <span>${Store.time(n.updated)}</span>
                    </div>
                </button>
            `).join('');

            this.elements.list.querySelectorAll('.note-card').forEach(card => {
                card.addEventListener('click', () => this.openEditor(card.dataset.id));
            });
        },

        escape(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        escapeAttr(text) {
            return this.escape(text).replace(/"/g, '&quot;');
        },
    };

    document.addEventListener('DOMContentLoaded', () => App.init());
})();