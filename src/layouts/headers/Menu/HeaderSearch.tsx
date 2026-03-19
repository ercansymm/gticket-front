import { useState } from "react";
import CloseIcon from "../../../svg/CloseIcon";
import SearchIcon from "../../../svg/SearchIcon";

interface MobileSidebarProps {
  isSearch: boolean;
  setIsSearch: (isSearch: boolean) => void;
}

const HeaderSearch = ({ isSearch, setIsSearch }: MobileSidebarProps) => {

  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchValue('');
    setIsSearch(false);
  };

  return (
    <>
      <div className={`search__popup ${isSearch ? "search-opened" : ""}`}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="search__wrapper">
                <div className="search__close">
                  <button onClick={() => setIsSearch(false)} type="button" className="search-close-btn">
                    <CloseIcon />
                  </button>
                </div>
                <div className="search__form">
                  <form onSubmit={handleSubmit}>
                    <div className="search__input">
                      <input
                        type="text"
                        placeholder="Type keywords here"
                        value={searchValue}
                        onChange={handleSearchChange}
                        className="search-input-field"
                      />
                      <span className="search-focus-border"></span>
                      <button>
                        <SearchIcon />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div onClick={() => setIsSearch(false)} className={`search-popup-overlay ${isSearch ? "search-popup-overlay-open" : ""}`}></div>
    </>
  )
}

export default HeaderSearch