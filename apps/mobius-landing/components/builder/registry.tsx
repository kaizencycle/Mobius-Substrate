'use client';

import { Builder } from '@builder.io/react';
import Hero from './Hero';
import MiiTicker from './MiiTicker';
import CTA from './CTA';
import FeatureGrid from './FeatureGrid';
import Footer from './Footer';

// Register components for the visual editor
Builder.registerComponent(Hero, {
  name: 'MobiusHero',
  inputs: [
    { name: 'eyebrow', type: 'text', defaultValue: 'Mobius Systems' },
    { name: 'title', type: 'text', required: true, defaultValue: 'Integrity-Native OS for Humans + AI' },
    { name: 'subtitle', type: 'longText', defaultValue: 'First KTT-native platform with MII/MIC and federated agents.' },
    { name: 'ctaLabel', type: 'text', defaultValue: 'Launch Codex' },
    { name: 'ctaHref', type: 'url', defaultValue: '/codex/jade' },
    { name: 'bgFractal', type: 'boolean', defaultValue: true },
  ],
});

Builder.registerComponent(MiiTicker, {
  name: 'MiiTicker',
  inputs: [
    { name: 'label', type: 'text', defaultValue: 'Mobius Integrity Index' },
    { name: 'env', type: 'text', defaultValue: 'prod' },
  ],
});

Builder.registerComponent(CTA, {
  name: 'MobiusCTA',
  inputs: [
    { name: 'title', type: 'text', defaultValue: 'Build with Integrity' },
    { name: 'body', type: 'longText', defaultValue: 'Start with KTT, ship on Mobius.' },
    { name: 'primaryLabel', type: 'text', defaultValue: 'Get Started' },
    { name: 'primaryHref', type: 'url', defaultValue: '/docs' },
  ],
});

Builder.registerComponent(FeatureGrid, {
  name: 'FeatureGrid',
  inputs: [
    {
      name: 'items',
      type: 'list',
      subFields: [
        { name: 'title', type: 'text' },
        { name: 'desc', type: 'longText' },
      ],
      defaultValue: [
        { title: 'KTT-Native', desc: 'Continuous evaluation with morale anchors.' },
        { title: 'MII/MIC', desc: 'Integrity metrics & credits baked into runtime.' },
        { title: 'Federated Agents', desc: 'Zeus · Jade · Eve · Hermes — model-agnostic.' },
      ],
    },
  ],
});

Builder.registerComponent(Footer, { 
  name: 'MobiusFooter' 
});
