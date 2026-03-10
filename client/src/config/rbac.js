export const ROLES = {
    SUPER_ADMIN:   'superadmin',
    NGO_ADMIN:     'ngoadmin',
    FIELD_OFFICER: 'fieldofficer',
    VIEWER:        'viewer',
    BENEFICIARY:   'beneficiary',
};

// ── Pages each role can access ───────────────────────────────
export const ROLE_PAGES = {
    superadmin:   ['dashboard', 'beneficiaries', 'requests', 'deliveries', 'reports'],
    ngoadmin:     ['dashboard', 'beneficiaries', 'requests', 'deliveries', 'reports'],
    fieldofficer: ['dashboard', 'requests', 'deliveries'],
    viewer:       ['dashboard', 'reports'],
    beneficiary:  ['beneficiary-portal'],
};

// ── Granular permissions ─────────────────────────────────────
export const PERMISSIONS = {
    // Beneficiaries
    CREATE_BENEFICIARY:  ['superadmin', 'ngoadmin'],
    EDIT_BENEFICIARY:    ['superadmin', 'ngoadmin'],
    DELETE_BENEFICIARY:  ['superadmin'],

    // Aid Requests
    CREATE_REQUEST:      ['superadmin', 'ngoadmin', 'fieldofficer'],
    APPROVE_REQUEST:     ['superadmin', 'ngoadmin'],
    REJECT_REQUEST:      ['superadmin', 'ngoadmin'],
    DELETE_REQUEST:      ['superadmin'],

    // Deliveries
    CREATE_DELIVERY:     ['superadmin', 'ngoadmin', 'fieldofficer'],
    UPDATE_DELIVERY:     ['superadmin', 'ngoadmin', 'fieldofficer'],
    DELETE_DELIVERY:     ['superadmin'],

    // Reports
    VIEW_REPORTS:        ['superadmin', 'ngoadmin', 'viewer'],
    EXPORT_REPORTS:      ['superadmin', 'ngoadmin'],
};

export function hasPermission(role, permission) {
    if (!role || !permission) return false;
    return PERMISSIONS[permission]?.includes(role) ?? false;
}

export function canAccessPage(role, page) {
    if (!role || !page) return false;
    return ROLE_PAGES[role]?.includes(page) ?? false;
}

export function getDefaultPage(role) {
    switch (role) {
        case ROLES.BENEFICIARY: return 'beneficiary-portal';
        case ROLES.VIEWER:      return 'dashboard';
        default:                return 'dashboard';
    }
}

export function getRoleLabel(role) {
    const labels = {
        superadmin:   'Super Admin',
        ngoadmin:     'NGO Admin',
        fieldofficer: 'Field Officer',
        viewer:       'Viewer',
        beneficiary:  'Beneficiary',
    };
    return labels[role] || role;
}

export function getRoleBadgeColor(role) {
    const colors = {
        superadmin:   'bg-red-100 text-red-700 border-red-200',
        ngoadmin:     'bg-purple-100 text-purple-700 border-purple-200',
        fieldofficer: 'bg-blue-100 text-blue-700 border-blue-200',
        viewer:       'bg-gray-100 text-gray-700 border-gray-200',
        beneficiary:  'bg-green-100 text-green-700 border-green-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
}