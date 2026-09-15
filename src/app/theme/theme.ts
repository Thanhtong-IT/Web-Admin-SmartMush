import type { ThemeConfig } from 'antd'

export const mcmsTheme: ThemeConfig = {
  token: {
    colorPrimary: '#15803d',
    colorSuccess: '#15803d',
    colorInfo: '#0f766e',
    colorWarning: '#a16207',
    colorError: '#c2413b',
    colorText: '#173321',
    colorTextSecondary: '#5f7164',
    colorBgBase: '#ffffff',
    colorBgLayout: '#f4f8f5',
    colorBgContainer: '#ffffff',
    colorBorder: '#dce8df',
    colorBorderSecondary: '#e8f0ea',
    borderRadius: 6,
    borderRadiusLG: 8,
    controlHeight: 40,
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadowTertiary: '0 1px 2px rgb(24 73 42 / 5%)',
  },
  components: {
    Layout: {
      bodyBg: '#f4f8f5',
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Menu: {
      itemHeight: 44,
      itemBorderRadius: 6,
      itemMarginInline: 12,
      itemMarginBlock: 3,
      itemSelectedBg: '#eaf7ee',
      itemSelectedColor: '#146c36',
      itemHoverBg: '#f3f8f4',
      itemHoverColor: '#146c36',
      groupTitleColor: '#718078',
    },
    Button: {
      borderRadius: 6,
      primaryShadow: 'none',
      defaultShadow: 'none',
      fontWeight: 600,
    },
    Card: {
      borderRadiusLG: 8,
      headerBg: '#ffffff',
    },
    Table: {
      headerBg: '#f7faf8',
      headerColor: '#365440',
      borderColor: '#e5eee7',
      rowHoverBg: '#f5faf6',
    },
    Input: {
      activeBorderColor: '#15803d',
      hoverBorderColor: '#26934c',
      activeShadow: '0 0 0 3px rgb(21 128 61 / 12%)',
    },
    Select: {
      activeBorderColor: '#15803d',
      hoverBorderColor: '#26934c',
      activeOutlineColor: 'rgb(21 128 61 / 12%)',
    },
    Tabs: {
      itemSelectedColor: '#15803d',
      itemHoverColor: '#15803d',
      inkBarColor: '#15803d',
    },
    Tag: {
      borderRadiusSM: 4,
    },
  },
}
