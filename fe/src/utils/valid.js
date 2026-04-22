export const isStrongPassword = (password) => {
    const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]<>?/]).{8,}$/;
    return regex.test(password);
};

export const renderNoiDungWithLink = (text, router) => {
    if (!text) return null;

    const regex = /((?:https?:\/\/[^\s]+)|(?:\/[a-zA-Z0-9\-/_?=&#.]+))/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
        if (!part) return null;

        // Link ngoài
        if (part.startsWith("http")) {
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{color: "#1677ff"}}
                    onClick={e => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        }

        // Link nội bộ
        if (part.startsWith("/")) {
            return (
                <a
                    key={index}
                    onClick={e => {
                        e.stopPropagation();
                        router.push(part);
                    }}
                    style={{color: "#1677ff", cursor: "pointer"}}
                >
                    {part}
                </a>
            );
        }

        return <span key={index}>{part}</span>;
    });
};
