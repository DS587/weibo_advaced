// ==UserScript==
// @name         Weibo Space
// @namespace    http://tampermonkey.net/
// @version      2026-03-28
// @description  重整微博版面 & 自动翻页
// @author       You
// @match        *://weibo.com/*
// @match        *://s.weibo.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=weibo.com
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    var theme_color = '#187298';
    var text_font_size = '13px';  // 正文字体大小

    // 从 localStorage 读取保存的设置
    const savedTheme = localStorage.getItem('weibo_theme_color');
    const savedFontSize = localStorage.getItem('weibo_text_font_size');

    if (savedTheme) theme_color = savedTheme;
    if (savedFontSize) text_font_size = savedFontSize;

    // 移除右侧栏
    GM_addStyle(`
    ._side_1l406_17 {
        display: none !important;
    }
    `);
    function createSettingsPanel() {
        // 创建设置按钮
        const settingsBtn = document.createElement('button');
        settingsBtn.innerHTML = '⚙️';
        settingsBtn.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: var(--w-brand, #187298);
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;

        // 创建设置面板
        const panel = document.createElement('div');
        panel.id = 'weibo-settings-panel';
        panel.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 80px;
            width: 300px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
        `;

        panel.innerHTML = `
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold; font-size: 14px;">主题颜色</label>
                <input type="color" id="theme-color-picker" value="${theme_color}" style="width: 100%; height: 40px; border: none; cursor: pointer; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold; font-size: 14px;">正文字体大小</label>
                <div style="display: flex; gap: 8px;">
                    <input type="range" id="font-size-slider" min="11" max="16" value="${parseInt(text_font_size)}" style="flex: 1; cursor: pointer;">
                    <input type="number" id="font-size-input" min="11" max="16" value="${parseInt(text_font_size)}" style="width: 50px; padding: 4px; border: 1px solid #ddd; border-radius: 4px;">
                    <span style="padding: 4px; width: 20px;">px</span>
                </div>
            </div>
            <button id="settings-close" style="width: 100%; padding: 8px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">关闭</button>
        `;

        document.body.appendChild(panel);
        document.body.appendChild(settingsBtn);

        // 按钮点击切换面板
        settingsBtn.addEventListener('click', () => {
            const isVisible = panel.style.display !== 'none';
            panel.style.display = isVisible ? 'none' : 'block';
        });

        // 关闭按钮
        document.getElementById('settings-close').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        // 主题颜色选择器
        const colorPicker = document.getElementById('theme-color-picker');
        colorPicker.addEventListener('change', (e) => {
            theme_color = e.target.value;
            localStorage.setItem('weibo_theme_color', theme_color);
            applyThemeColor(theme_color);
        });
        colorPicker.addEventListener('input', (e) => {
            theme_color = e.target.value;
            applyThemeColor(theme_color);
        });

        // 字体大小滑块和输入框
        const fontSizeSlider = document.getElementById('font-size-slider');
        const fontSizeInput = document.getElementById('font-size-input');

        const updateFontSize = (value) => {
            text_font_size = value + 'px';
            fontSizeSlider.value = value;
            fontSizeInput.value = value;
            localStorage.setItem('weibo_text_font_size', text_font_size);
            applyFontSize(text_font_size);
        };

        fontSizeSlider.addEventListener('input', (e) => updateFontSize(e.target.value));
        fontSizeInput.addEventListener('change', (e) => updateFontSize(e.target.value));
    }

    // 实时应用主题颜色
    function applyThemeColor(color) {
        let styleEl = document.getElementById('weibo-theme-dynamic');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'weibo-theme-dynamic';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = `
            :root {
                --w-brand: ${color} !important;
                --weibo-top-nav-icon-badge-color: ${color} !important;
                --w-badge-background: ${color} !important;
            }
        `;
    }

    // 实时应用字体大小
    function applyFontSize(size) {
        let styleEl = document.getElementById('weibo-font-dynamic');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'weibo-font-dynamic';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = `
            :root {
                --feed-text-font-size: ${size} !important;
            }
            ._wbtext_q1l14_14 {
                font-size: ${size} !important;
            }
        `;
    }

    // 初始化设置面板 - 确保 DOM 已准备好
    function initSettingsPanel() {
        try {
            createSettingsPanel();
        } catch (e) {
            console.log('等待 DOM 加载...', e);
            setTimeout(initSettingsPanel, 500);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSettingsPanel);
    } else {
        setTimeout(initSettingsPanel, 100);
    }

    // 自动跳转到"最新微博"页面（无感跳转，避免首页渲染）
    if (location.pathname === '/' && !location.search.includes('mygroups')) {
        // 尝试从 localStorage 缓存读取，或等待 DOM 中的链接出现
        let targetUrl = sessionStorage.getItem('weibo_latest_url');

        if (targetUrl) {
            location.replace(targetUrl);
        } else {
            // 快速检查是否已经有链接可用
            const link = document.querySelector('a:has(div[title="最新微博"])');
            if (link && link.href) {
                sessionStorage.setItem('weibo_latest_url', link.href);
                location.replace(link.href);
            } else {
                // 降级方案：等待导航栏加载
                const observer = new MutationObserver(() => {
                    const navLink = document.querySelector('a:has(div[title="最新微博"])');
                    if (navLink && navLink.href) {
                        sessionStorage.setItem('weibo_latest_url', navLink.href);
                        location.replace(navLink.href);
                        observer.disconnect();
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
                // 超时保护：5秒后停止观察
                setTimeout(() => observer.disconnect(), 5000);
            }
        }
    }

    // 初始配色（主题颜色将由设置面板动态控制）
    applyThemeColor(theme_color);
    applyFontSize(text_font_size);

    // 其他配色规则
    GM_addStyle(`
        .NavItem_main_2hs9r .woo-badge-outlying{
            color: var(--w-brand) !important;
        }
        .UG_tips, .ProfileHeader_tag_2Ku6K{
            color: var(--w-brand) !important;
        }
        .LoginTopNav_logoS_wOXns path{
            fill: var(--w-brand) !important;
        }
        .W_btn_a:hover, .Nav_pub_QrDht:hover, .BackTop_main_3m3aB:hover, .woo-button-flat.woo-button-primary:hover{
            background: var(--w-brand) !important;
        }
    `);

        // 字体
        GM_addStyle (`
        .head_cut_2Zcft{
            font-size:1.2rem!important;
            line-height:1.3rem!important;
        }
        .head-info_info_2AspQ{
            line-height:1rem!important;
        }
        .wbpro-feed-ogText .detail_wbtext_4CRf9 img{
            width:25px!important;
            height:25px!important;
            margin:0 3px!important;
            vertical-align:-2px!important;
        }
        .UG_left_nav .nav_item{
            font-size:16px!important;
        }
    `);
})();
