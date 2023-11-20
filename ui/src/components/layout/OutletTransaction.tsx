import React from 'react';
import { useLocation } from 'react-router-dom';

import { motion, Variants, Transition } from 'framer-motion';

const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 10
    },
    in: {
        opacity: 1,
        y: 0
    }
};

const pageTransition: Transition = {
    type: 'tween',
    ease: 'linear',
    delay: 0.3,
    duration: 0.15
};

const OutletTransaction: React.F = ({ children }) => {
    const { pathname } = useLocation();

    return (
        <motion.div key={pathname} initial="initial" animate="in" variants={pageVariants} transition={pageTransition}>
            {children}
        </motion.div>
    );
};

export default OutletTransaction;
