import dunesDark from '@/assets/net-login-dark.png';
import dunesLight from '@/assets/net-login-light.png';

export function Dunes() {
    return (
        <div className="hidden w-full lg:block md:block m-6">
            <img
                className="w-full h-full object-cover rounded-xl hidden dark:flex"
                src={dunesDark}
                alt="Analogia dunes dark"
            />
            <img
                className="w-full h-full object-cover rounded-xl flex dark:hidden"
                src={dunesLight}
                alt="Analogia dunes light"
            />
        </div>
    );
}
